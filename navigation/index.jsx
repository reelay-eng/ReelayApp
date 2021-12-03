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
         const { date, request } = notification;
         const { identifier, content, trigger } = request;
         const { 
             title, 
             subtitle, 
             body, 
             data, 
             badge, 
             sound, 
             categoryIdentifier 
         } = content;
         console.log('NOTIFICATION RECEIVED', content);
     }
 
     const onNotificationResponseReceived = (notificationResponse) => {
         const { notification, actionIdentifier, userText } = notificationResponse;
         const { date, request } = notification;
         const { identifier, content, trigger } = request;
         const { 
             title, 
             subtitle, 
             body, 
             data, 
             badge, 
             sound, 
             categoryIdentifier 
         } = content;
 
         console.log('NOTIFICATION RESPONSE RECEIVED', content);
 
         if (navigationRef?.current) {
             console.log(navigationRef.current);
             console.log(navigationRef.current.getCurrentOptions());
             console.log(navigationRef.current.getCurrentRoute());
             navigationRef.current.navigate('SingleReelayScreen', {
                 reelaySub: '5044916d-92d0-49a1-8ffe-8c8f4d19e296',
             })
         } else {
             console.log('No navigation ref');
         }
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