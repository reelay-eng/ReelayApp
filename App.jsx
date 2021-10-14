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

    // replace
    // useEffect(() => {
    //     authenticateUserAndRegisterPushTokens();
    //     // // notification setup
    //     // // https://docs.expo.dev/versions/latest/sdk/notifications/ 
    //     notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
    //         console.log('Notification received');
    //         setNotification(Boolean(notification));
    //     });
    //     responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
    //         console.log('Notification response received');
    //         console.log(response);
    //     });
    //     return () => {
    //         Notifications.removeNotificationSubscription(notificationListener.current);
    //         Notifications.removeNotificationSubscription(responseListener.current);
    //     }
    // }, []);

    useEffect(() => {
        authenticateUser();
    }, []);

    useEffect(() => {
        registerUserAndPushTokens();
    }, [user]);

    const registerUserAndPushTokens = async () => {
        const validUser = user?.username;
        if (!validUser) return;

        try {
            const registeredUser = await registerUser(user);
            const pushToken = await registerForPushNotificationsAsync();
            await registerPushTokenForUser(registeredUser, pushToken);

            notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
                console.log('Notification received');
                setNotification(Boolean(notification));
            });
            responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                console.log('Notification response received');
                console.log(response);
            }); 
            return () => {
                Notifications.removeNotificationSubscription(notificationListener.current);
                Notifications.removeNotificationSubscription(responseListener.current);
            }   
        } catch (error) {
            console.log(error);
        }
    }

    // const authenticateUserAndRegisterPushTokens = async () => {
    //     console.log('Setting up authentication');
    //     try {
    //         const session = await Auth.currentSession();
    //         const user = await Auth.currentAuthenticatedUser();
    //         const credentials = await Auth.currentUserCredentials();
    //         const pushToken = await registerForPushNotificationsAsync();

    //         if (credentials.authenticated) {
    //             setSession(session);
    //             setUser(user);
    //             setCredentials(credentials);
    //             setSignedIn(true);

    //             if (user && pushToken) {
    //                 const registeredUser = await getRegisteredUser(user.attributes.sub);
    //                 if (registeredUser.error) {
    //                     await registerUser(user, pushToken);
    //                 } else if (registeredUser.pushToken != pushToken) {
    //                     console.log('push tokens don\'t match!');
    //                 }   
    //                 updatePushTokens(user, pushToken);
    //             }    
    //         }
    //     } catch (error) {
    //         console.log(error);
    //         Amplitude.logEventWithPropertiesAsync('authError', {
    //             error: error,
    //         });
    //     }
    //     console.log('authentication complete');
    //     setIsLoading(false);
    // }

    // step 1: authenticate user
    // step 1.5: loading is done
    // step 2: check if user is registered
    // step 3: attempt to get push token
    // step 4: if user is not registered
    //          register user
    //          include push token if present
    // step 5: else if registered push token is null or doesn't match
    //          register new push token for user

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

    const updatePushTokens = async (user, pushToken) => {
        setExpoPushToken(pushToken);
        console.log('push token set');
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

    const vizState = {
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
                    <FeedContext.Provider value={vizState}>
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