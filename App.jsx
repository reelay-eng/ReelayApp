// react imports
import React, { useEffect, useRef, useState } from 'react';
import { Image, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './navigation';
import styled from 'styled-components/native';

// aws imports
import { Amplify, Auth, Storage } from 'aws-amplify';
import AWSConfig from "./src/aws-exports";

// expo and amplitude imports
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Amplitude from 'expo-analytics-amplitude';
import { StatusBar } from 'expo-status-bar';
import useColorScheme from './hooks/useColorScheme';

// context imports
import { AuthContext } from './context/AuthContext';
import { FeedContext } from './context/FeedContext';
import { UploadContext } from './context/UploadContext';

// api imports
import { registerUser, registerPushTokenForUser } from './api/ReelayDBApi';
import { registerForPushNotificationsAsync } from './api/NotificationsApi';
import { showErrorToast } from './components/utils/toasts';

const SPLASH_IMAGE_SOURCE = require('./assets/images/reelay-splash.png');

Amplify.configure({
    ...AWSConfig,
    Analytics: {
        disabled: true,
    },
});

Auth.configure({ mandatorySignIn: false });

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

Storage.configure({ level: 'public' });

function App() {
    const colorScheme = useColorScheme();

    // push notifications
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();

    // Auth context hooks
    const [credentials, setCredentials] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [signedIn, setSignedIn] = useState(false);
    const [session, setSession] = useState({});
    const [user, setUser] = useState({});
    const [username, setUsername] = useState('');

    // Visibility context hooks
    // TODO: this is really all about FEED visibility...
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [currentComment, setCurrentComment] = useState('');
    const [likesVisible, setLikesVisible] = useState(false);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [overlayData, setOverlayData] = useState({});
    const [tabBarVisible, setTabBarVisible] = useState(true);

    // Upload context hooks
    const [chunksUploaded, setChunksUploaded] = useState(0);
    const [chunksTotal, setChunksTotal] = useState(0);
    const [hasSelectedTitle, setHasSelectedTitle] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);
    const [uploadTitleObject, setUploadTitleObject] = useState({});
    const [uploadOptions, setUploadOptions] = useState({});
    const [uploadErrorStatus, setUploadErrorStatus] = useState(false);
    const [uploadVideoSource, setUploadVideoSource] = useState('');
    const [venueSelected, setVenueSelected] = useState('');

    Amplitude.initializeAsync(Constants.manifest.extra.amplitudeApiKey);

    useEffect(() => {
        authenticateUser();
    }, []);

    useEffect(() => {
        console.log('IN USE EFFECT');
        console.log(user);
        registerUserAndPushTokens();
    }, [user]);

    const authenticateUser = async () => {
        console.log('Setting up authentication');
        try {
            const session = await Auth.currentSession();
            const user = await Auth.currentAuthenticatedUser();
            const credentials = await Auth.currentUserCredentials();

            if (credentials.authenticated) {
                setSession(session);
                setUser(user);
                setCredentials(credentials);
                setSignedIn(true);
            }
        } catch (error) {
            console.log(error);
            Amplitude.logEventWithPropertiesAsync('authError', {
                error: error,
            });
        }
        console.log('authentication complete');
        setIsLoading(false);
    }

    const registerUserAndPushTokens = async () => {
        const validUser = user?.username;
        if (!validUser) return;

        try {
            const registeredUser = await registerUser(user);
            if (registeredUser.error) {
                showErrorToast(
                    "We couldn't register your device for push notifications. Please contact the Reelay team."
                );
                Amplitude.logEventWithPropertiesAsync('registerUserError', {
                    username: user.username
                });
                return;
            }

            const devicePushToken = await registerForPushNotificationsAsync();
            console.log(registeredUser);
            if (!registeredUser.pushToken || registeredUser.pushToken !== devicePushToken) {
                console.log('Registering new push token');
                await registerPushTokenForUser(registeredUser, devicePushToken);
            } else {
                console.log('Push token already registered');
            }

            notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
                console.log('Notification received');
                setNotification(Boolean(notification));
                console.log(notification);
                Amplitude.logEventWithPropertiesAsync('notificationRecieved', {
                    username: user.username,
                    notification: notification,
                });

            });
            responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                console.log('Notification response received');
                console.log(response);
                Amplitude.logEventWithPropertiesAsync('notificationResponseRecieved', {
                    username: user.username,
                    response: response,
                });

            }); 
            setExpoPushToken(devicePushToken);

            return () => {
                Notifications.removeNotificationSubscription(notificationListener.current);
                Notifications.removeNotificationSubscription(responseListener.current);
            }   
        } catch (error) {
            console.log(error);
        }
    }

    const authState = {
        credentials,        setCredentials,
        expoPushToken,      setExpoPushToken,
        isLoading,          setIsLoading,
        session,            setSession,
        signedIn,           setSignedIn,
        user,               setUser,
        username,           setUsername,
    }

    const uploadState = {
        chunksUploaded,     setChunksUploaded,
        chunksTotal,        setChunksTotal,
        hasSelectedTitle,   setHasSelectedTitle,
        uploading,          setUploading,
        uploadComplete,     setUploadComplete,
        uploadTitleObject,  setUploadTitleObject,
        uploadOptions,      setUploadOptions,
        uploadErrorStatus,  setUploadErrorStatus,
        uploadVideoSource,  setUploadVideoSource,
        venueSelected,      setVenueSelected,
    }

    const feedState = {
        commentsVisible,    setCommentsVisible,
        currentComment,     setCurrentComment,
        likesVisible,       setLikesVisible,
        overlayData,        setOverlayData,
        overlayVisible,     setOverlayVisible,
        tabBarVisible,      setTabBarVisible,
    }

    if (isLoading) {
        const SplashContainer = styled(View)`
            height: 100%;
            width: 100%;
            position: absolute;
        `
        const SplashImage = styled(Image)`
            height: 100%;
            width: 100%;
            position: absolute;
        `
        return (
            <SplashContainer>
                <SplashImage source={SPLASH_IMAGE_SOURCE} />
            </SplashContainer>
        );

    } else {
        return (
            <SafeAreaProvider>
                <AuthContext.Provider value={authState}>
                    <FeedContext.Provider value={feedState}>
                        <UploadContext.Provider value={uploadState}>
                            <StatusBar hidden={true} />
                            <Navigation colorScheme={colorScheme} />
                        </UploadContext.Provider>
                    </FeedContext.Provider>
                </AuthContext.Provider>
            </SafeAreaProvider>
        );
    }
}

export default App;