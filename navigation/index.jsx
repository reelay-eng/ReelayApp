/**
 * If you are not familiar with React Navigation, check out the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import React, { useContext, useEffect, useRef, useState } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { 
    addNotificationReceivedListener, 
    addNotificationResponseReceivedListener,
    getBadgeCountAsync,
    removeNotificationSubscription,
    setBadgeCountAsync,
} from 'expo-notifications';
import * as Linking from 'expo-linking';

import { AuthContext } from '../context/AuthContext';

import AuthenticatedNavigator from './AuthenticatedNavigator';
import UnauthenticatedNavigator from './UnauthenticatedNavigator';
import AccountSuspendedScreen from '../screens/suspended/AccountSuspendedScreen';
import LinkingConfiguration from './LinkingConfiguration';

import moment from 'moment';
import { handlePushNotificationResponse } from './NotificationHandler';
import { markNotificationReceived } from '../api/NotificationsApi';
import { useDispatch, useSelector } from 'react-redux';
import { logAmplitudeEventProd } from '../components/utils/EventLogger';
import { uploadReelay } from '../api/UploadAPI';

const UUID_LENGTH = 36;

export default Navigation = () => {
    /**
     * https://docs.expo.dev/versions/latest/sdk/notifications/#notificationrequest
     * https://docs.expo.dev/versions/latest/sdk/notifications/#notificationcontent
     * https://docs.expo.dev/versions/latest/sdk/notifications/#notificationresponse
     * https://docs.expo.dev/versions/latest/sdk/notifications/#handling-push-notifications-with-react-navigation
     */

    const { reelayDBUser } = useContext(AuthContext);

    const navigationRef = useRef();
    const notificationListener = useRef();
    const responseListener = useRef(); 
    const [deeplinkURL, setDeeplinkURL] = useState(null);

    const dispatch = useDispatch();
    const globalTopics = useSelector(state => state.globalTopics);
    const myClubs = useSelector(state => state.myClubs);
    const myWatchlistItems = useSelector(state => state.myWatchlistItems);

    const s3Client = useSelector(state => state.s3Client);
    const uploadRequest = useSelector(state => state.uploadRequest);
    const uploadStage = useSelector(state => state.uploadStage);

    const setUploadProgress = (progress) => dispatch({ type: 'setUploadProgress', payload: progress });
    const setUploadStage = (stage) => dispatch({ type: 'setUploadStage', payload: stage });
    const clearUploadRequest = () => dispatch({ type: 'setUploadRequest', payload: null });

    const handleDeepLink = async (event) => {
        const deeplinkURL = Linking.parse(event.url);
        if (deeplinkURL) {
            setDeeplinkURL(deeplinkURL);
        }
    }

    const initDeeplinkHandlers = async () => {
        Linking.addEventListener('url', handleDeepLink);
        const initialURL = await Linking.getInitialURL();
        if (initialURL) {
            setDeeplinkURL(Linking.parse(initialURL));
        }
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
            myClubs,
            navigation: navigationRef?.current, 
            notificationContent,
            reelayDBUser,
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
        initDeeplinkHandlers();
        notificationListener.current = addNotificationReceivedListener(onNotificationReceived);
        responseListener.current = addNotificationResponseReceivedListener(onNotificationResponseReceived);

        return () => {
            removeNotificationSubscription(notificationListener.current);
            removeNotificationSubscription(responseListener.current);
            Linking.removeEventListener('url');
        }
    }, []);

    useEffect(() => {
        if (deeplinkURL) {
            const navigation = navigationRef?.current;
            const { path } = deeplinkURL;
            logAmplitudeEventProd('openedAppFromDeeplink', {
                username: reelayDBUser?.username,
                deeplink: JSON.stringify(deeplinkURL),
                path: path,
            });

            if (path?.startsWith('reelay/')) {
                const reelaySub = path.substr('reelay/'.length);
                if (reelaySub) {
                    navigation.navigate('SingleReelayScreen', { reelaySub });
                }
            } else if (path.length === UUID_LENGTH) {
                // assume it's a reelay sub -- not entirely sure why it's cutting
                // off 'reelay/' from the front of path, but that's what we're seeing
                const reelaySub = path;
                navigation.navigate('SingleReelayScreen', { reelaySub });
            }
        }
    }, [deeplinkURL]);

    useEffect(() => {
        const uploadReadyToStart = (
            uploadRequest && 
            uploadRequest?.reelayDBBody && 
            uploadStage === 'upload-ready'
        );
        if (uploadReadyToStart) {
            dispatch({ type: 'setUploadStage', payload: 'uploading' });
            uploadRequest.s3Client = s3Client;
            uploadRequest.setUploadProgress = setUploadProgress;
            uploadRequest.setUploadStage = setUploadStage;
            uploadRequest.clearUploadRequest = clearUploadRequest;
            uploadReelay(uploadRequest);
        }
    }, [uploadRequest, uploadStage]);
    
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
    const { reelayDBUser } = useContext(AuthContext);
    const signedIn = useSelector(state => state.signedIn);
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
