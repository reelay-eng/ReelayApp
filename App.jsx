// react imports
import React, { useEffect, useRef, useState } from 'react';
import { Image, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './navigation';
import styled from 'styled-components/native';

// aws imports
import { Amplify, Auth, Storage } from 'aws-amplify';
import { Audio } from 'expo-av';
import AWSExports from "./src/aws-exports";

import { S3Client } from '@aws-sdk/client-s3';
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";

// polyfill imports required for S3 connection
import { setupURLPolyfill } from 'react-native-url-polyfill';
import 'react-native-get-random-values';

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
import { registerUser, registerPushTokenForUser, getRegisteredUser } from './api/ReelayDBApi';
import { registerForPushNotificationsAsync } from './api/NotificationsApi';
import { showErrorToast } from './components/utils/toasts';

const SPLASH_IMAGE_SOURCE = require('./assets/images/reelay-splash.png');

function App() {
    const colorScheme = useColorScheme();

    // push notifications
    const [expoPushToken, setExpoPushToken] = useState('');

    // Auth context hooks
    const [cognitoUser, setCognitoUser] = useState({});
    const [credentials, setCredentials] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [reelayDBUser, setReelayDBUser] = useState({});
    const [signedIn, setSignedIn] = useState(false);
    const [session, setSession] = useState({});
    const [username, setUsername] = useState('');

    // Feed context hooks
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [currentComment, setCurrentComment] = useState('');
    const [likesVisible, setLikesVisible] = useState(false);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [overlayData, setOverlayData] = useState({});
    const [paused, setPaused] = useState(false);
    const [playPauseVisible, setPlayPauseVisible] = useState('none');
    const [tabBarVisible, setTabBarVisible] = useState(true);

    // Upload context hooks
    const [s3Client, setS3Client] = useState(null);

    useEffect(() => {
        initServices();
        authenticateUser();
    }, []);

    useEffect(() => {
        registerUserAndPushTokens();
    }, [cognitoUser]);

    const initServices = async () => {
        Amplitude.initializeAsync(
            Constants.manifest.extra.amplitudeApiKey
        );

        Amplify.configure({
            ...AWSExports,
            Analytics: {
                disabled: true,
            },
        });
        
        Auth.configure({ mandatorySignIn: false });
        Storage.configure({ level: 'public' });    
        initS3Client();
        
        Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
            interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        });
        
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: false,
                shouldSetBadge: false,
            }),
        });
    }

    const initS3Client = () => {
        try {
            setupURLPolyfill();
            setS3Client(new S3Client({
                region: AWSExports.aws_project_region,
                credentials: fromCognitoIdentityPool({
                    client: new CognitoIdentityClient({ 
                        region: AWSExports.aws_cognito_region 
                    }),
                    identityPoolId: AWSExports.aws_cognito_identity_pool_id,
                }),
            }));    
        } catch (error) {
            console.log('Could not initialize S3 client');
            console.log(error);
        }
    }

    const authenticateUser = async () => {
        console.log('Setting up authentication');
        try {
            const session = await Auth.currentSession();
            const cognitoUser = await Auth.currentAuthenticatedUser();
            const credentials = await Auth.currentUserCredentials();

            if (credentials.authenticated) {
                setSession(session);
                setCognitoUser(cognitoUser);
                setCredentials(credentials);
                setSignedIn(true);

                const myReelayDBUser = await getRegisteredUser(cognitoUser.attributes.sub);
                setReelayDBUser(myReelayDBUser);
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
        const validUser = cognitoUser?.username;
        if (!validUser) return;

        try {
            const registeredUser = await registerUser(cognitoUser);
            if (registeredUser.error) {
                showErrorToast(
                    "We couldn't register your device for push notifications. Please contact the Reelay team."
                );
                Amplitude.logEventWithPropertiesAsync('registerUserError', {
                    username: cognitoUser.username
                });
                return;
            }

            const devicePushToken = await registerForPushNotificationsAsync();
            if (!registeredUser.pushToken || registeredUser.pushToken !== devicePushToken) {
                console.log('Registering new push token');
                await registerPushTokenForUser(registeredUser, devicePushToken);
            } else {
                console.log('Push token already registered');
            }

            setExpoPushToken(devicePushToken);
        } catch (error) {
            console.log(error);
        }
    }

    const authState = {
        cognitoUser,        setCognitoUser,
        credentials,        setCredentials,
        expoPushToken,      setExpoPushToken,
        isLoading,          setIsLoading,
        reelayDBUser,       setReelayDBUser,
        session,            setSession,
        signedIn,           setSignedIn,
        username,           setUsername,
    }

    const uploadState = {
        s3Client,           setS3Client,
    }

    const feedState = {
        commentsVisible,    setCommentsVisible,
        currentComment,     setCurrentComment,
        likesVisible,       setLikesVisible,
        overlayData,        setOverlayData,
        overlayVisible,     setOverlayVisible,
        paused,             setPaused,
        playPauseVisible,   setPlayPauseVisible,
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