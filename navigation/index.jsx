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
    removeNotificationSubscription,
} from 'expo-notifications';

import { AuthContext } from '../context/AuthContext';

import AuthenticatedNavigator from './AuthenticatedNavigator';
import UnauthenticatedNavigator from './UnauthenticatedNavigator';
import AccountSuspendedScreen from '../screens/suspended/AccountSuspendedScreen';
import LinkingConfiguration from './LinkingConfiguration';

import { getReelay, prepareReelay } from '../api/ReelayDBApi';
import moment from 'moment';
import { logAmplitudeEventProd } from '../components/utils/EventLogger';

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

    const { cognitoUser } = useContext(AuthContext);
    
    const onNotificationReceived = (notification) => {
        const content = parseNotificationContent(notification);
        console.log('NOTIFICATION RECEIVED', content);
    }
 
     const onNotificationResponseReceived = async (notificationResponse) => {
        const { notification, actionIdentifier, userText } = notificationResponse;
        const { title, body, data } = parseNotificationContent(notification);

        const action = data?.action;
        if (!action) {
            console.log('No action given');
            return;
        }

        logAmplitudeEventProd('openedNotification', {
            username: cognitoUser?.username,
            sub: cognitoUser?.attributes.sub,
            action,
            title, 
            body,
        });

        if (action === 'openSingleReelayScreen') {
            if (!data.reelaySub) {
                console.log('No reelay sub given');
            } else {
                openSingleReelayScreen(data.reelaySub);
            }
        } else if (action === 'openUserProfileScreen') {
            if (!data.user) {
              console.log("No user given");
            } else {
                openUserProfileScreen(data.user);
            }
        } else if (action === 'openCreateScreen') {
            openCreateScreen();
        } else if (action === 'openMyRecs') {
            openMyRecs();
        }
    }

    const openCreateScreen = async () => {
        if (!navigationRef?.current) {
            console.log('No navigation ref');
            return;
        }
        navigationRef.current.navigate('Create');
    }

    const openMyRecs = async () => {
        if (!navigationRef?.current) {
            console.log('No navigation ref')
            return;
        }
        navigationRef.current.navigate('WatchlistScreen', {
            category: 'Recs',
            refresh: true,
        });
    }

    const openSingleReelayScreen = async (reelaySub) => {
        if (!navigationRef?.current) {
            console.log('No navigation ref')
            return;
        }

        const singleReelay = await getReelay(reelaySub);
        const preparedReelay = await prepareReelay(singleReelay); 
        navigationRef.current.navigate('SingleReelayScreen', { preparedReelay })
    }

    const openUserProfileScreen = async (user) => {
        if (!navigationRef?.current) {
            console.log("No navigation ref");
            return;
        }
        navigationRef.current.navigate('UserProfileScreen', { creator: user });
    };

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
    const { signedIn, setCognitoUser, reelayDBUser, setReelayDBUser, setSession, setCredentials } = useContext(AuthContext);
    let isCurrentlyBanned = false;
    if (reelayDBUser?.isBanned) {
        isCurrentlyBanned = (moment(reelayDBUser?.banExpiryAt).diff(moment(), 'minutes') > 0);
    }

    useEffect(() => {
        if (!signedIn) {
            setCognitoUser({});
            setReelayDBUser({});
            setSession({});
            setCredentials({});    
        }
    }, [signedIn]);

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            { signedIn && isCurrentlyBanned && <Stack.Screen name="Suspended" component={AccountSuspendedScreen} /> }
            { signedIn && !isCurrentlyBanned && <Stack.Screen name="Authenticated" component={AuthenticatedNavigator} /> }
            { !signedIn && <Stack.Screen name="Unauthenticated" component={UnauthenticatedNavigator} /> }
        </Stack.Navigator>
    );
}
