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
import NotFoundScreen from '../screens/unauthenticated/NotFoundScreen';

import AuthenticatedNavigator from './AuthenticatedNavigator';
import UnauthenticatedNavigator from './UnauthenticatedNavigator';
import LinkingConfiguration from './LinkingConfiguration';

import { getReelay, prepareReelay } from '../api/ReelayDBApi';

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
    
    const onNotificationReceived = (notification) => {
        const content = parseNotificationContent(notification);
        console.log('NOTIFICATION RECEIVED', content);
    }
 
     const onNotificationResponseReceived = async (notificationResponse) => {
        const { notification, actionIdentifier, userText } = notificationResponse;
        const { data } = parseNotificationContent(notification);

        const action = data?.action;
        if (!action) {
            console.log('No action given');
            return;
        }

        if (action === 'openSingleReelayScreen') {
            if (!data.reelaySub) {
                console.log('No reelay sub given');
            }
            openSingleReelayScreen(data.reelaySub);
        }

        if (action === "openUserProfileScreen") {
            if (!data.user) {
              console.log("No reelay sub given");
            }
            openUserProfileScreen(data.user);
        }
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
        console.log('plz open')
        if (!navigationRef?.current) {
            console.log("No navigation ref");
            return;
        }

        // make it work for users
        navigationRef.current.navigate("UserProfileScreen", {
            creator: user
        });
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
    const { signedIn } = useContext(AuthContext);

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            { signedIn && <Stack.Screen name="Authenticated" component={AuthenticatedNavigator} /> }
            { !signedIn && <Stack.Screen name="Unauthenticated" component={UnauthenticatedNavigator} /> }
            <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
        </Stack.Navigator>
    );
}