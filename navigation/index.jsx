/**
 * If you are not familiar with React Navigation, check out the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import React, { useContext, useEffect, useRef } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { 
    addNotificationReceivedListener, 
    addNotificationResponseReceivedListener,
    getBadgeCountAsync,
    removeNotificationSubscription,
    setBadgeCountAsync,
} from 'expo-notifications';

import { AuthContext } from '../context/AuthContext';

import AuthenticatedNavigator from './AuthenticatedNavigator';
import UnauthenticatedNavigator from './UnauthenticatedNavigator';
import AccountSuspendedScreen from '../screens/suspended/AccountSuspendedScreen';
import LinkingConfiguration from './LinkingConfiguration';

import moment from 'moment';
import { handlePushNotificationResponse } from './NotificationHandler';
import { markNotificationReceived } from '../api/NotificationsApi';
import { useDispatch, useSelector } from 'react-redux';

export default Navigation = () => {
    /**
     * https://docs.expo.dev/versions/latest/sdk/notifications/#notificationrequest
     * https://docs.expo.dev/versions/latest/sdk/notifications/#notificationcontent
     * https://docs.expo.dev/versions/latest/sdk/notifications/#notificationresponse
     * https://docs.expo.dev/versions/latest/sdk/notifications/#handling-push-notifications-with-react-navigation
     */
    const navigationRef = useRef();
    const notificationListener = useRef();
    const responseListener = useRef(); 
    const { reelayDBUser } = useContext(AuthContext);
    const myWatchlistItems = useSelector(state => state.myWatchlistItems);
    const dispatch = useDispatch();

    const setMyWatchlistItems = (payload) => {
        dispatch({ type: 'setMyWatchlistItems', payload });
    }
    
    const onNotificationReceived = async (notification) => {
        const notificationContent = parseNotificationContent(notification);
        console.log('NOTIFICATION RECEIVED', notificationContent);

        const { id } = notificationContent;
        markNotificationReceived(id);

        const badgeCount = await getBadgeCountAsync();
        setBadgeCountAsync(badgeCount + 1);
    }
 
    const onNotificationResponseReceived = async (notificationResponse) => {
        const { notification, actionIdentifier, userText } = notificationResponse;
        const notificationContent = parseNotificationContent(notification);
        handlePushNotificationResponse({ 
            myWatchlistItems,
            navigation: navigationRef?.current, 
            notificationContent,
            reelayDBUser,
            setMyWatchlistItems,
        });
    }

    const parseNotificationContent = (notification) => {
        const { date, request } = notification;
        const { identifier, content, trigger } = request;
    
        /** You can use the following from the content object:
            const { 
                title, 
                subtitle, 
                body, 
                data, 
                badge, 
                sound, 
                categoryIdentifier 
            } = content;
        */
    
        return content;
    }    
    
    useEffect(() => {
        notificationListener.current = addNotificationReceivedListener(onNotificationReceived);
        responseListener.current = addNotificationResponseReceivedListener(onNotificationResponseReceived);

        return () => {
            removeNotificationSubscription(notificationListener.current);
            removeNotificationSubscription(responseListener.current);
        }
    }, []);
    
    return (
        <NavigationContainer ref={navigationRef}
            linking={LinkingConfiguration}
            theme={DarkTheme}>
            <RootNavigator />
        </NavigationContainer>
    );
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator();

const RootNavigator = () => {
    const { signedIn, reelayDBUser } = useContext(AuthContext);
    let isCurrentlyBanned = false;
    if (reelayDBUser?.isBanned) {
        isCurrentlyBanned = (moment(reelayDBUser?.banExpiryAt).diff(moment(), 'minutes') > 0);
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            { signedIn && isCurrentlyBanned && <Stack.Screen name="Suspended" component={AccountSuspendedScreen} /> }
            { signedIn && !isCurrentlyBanned && <Stack.Screen name="Authenticated" component={AuthenticatedNavigator} /> }
            { !signedIn && <Stack.Screen name="Unauthenticated" component={UnauthenticatedNavigator} /> }
        </Stack.Navigator>
    );
}
