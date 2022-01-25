// react imports
import React, { useEffect, useRef, useState } from 'react';
import { Image, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './navigation';
import styled from 'styled-components/native';
import AsyncStorage from "@react-native-async-storage/async-storage";

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
import { logAmplitudeEventProd } from './components/utils/EventLogger';
import { StatusBar } from 'expo-status-bar';
import useColorScheme from './hooks/useColorScheme';

// context imports
import { AuthContext } from './context/AuthContext';
import { FeedContext } from './context/FeedContext';
import { UploadContext } from './context/UploadContext';

// api imports
import { 
    getFollowers, 
    getFollowing, 
    getRegisteredUser, 
    getStacksByCreator, 
    registerUser, 
    registerPushTokenForUser,
} from './api/ReelayDBApi';
import { registerForPushNotificationsAsync } from './api/NotificationsApi';
import { showErrorToast } from './components/utils/toasts';

// font imports
import * as Font from 'expo-font';

const SPLASH_IMAGE_SOURCE = require('./assets/images/reelay-splash.png');

function App() {
    const colorScheme = useColorScheme();

    // push notifications
    const [expoPushToken, setExpoPushToken] = useState('');

    // Auth context hooks
    const [cognitoUser, setCognitoUser] = useState({});
    const [credentials, setCredentials] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [myFollowers, setMyFollowers] = useState([]);
    const [myFollowing, setMyFollowing] = useState([]);
    const [myCreatorStacks, setMyCreatorStacks] = useState([]);
    const [reelayDBUser, setReelayDBUser] = useState({});
    const [signedIn, setSignedIn] = useState(false);
    const [session, setSession] = useState({});
    const [username, setUsername] = useState('');
    const [isReturningUser, setIsReturningUser] = useState(false);

    // Feed context hooks
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [currentComment, setCurrentComment] = useState('');
    const [dotMenuVisible, setDotMenuVisible] = useState(false);
    const [likesVisible, setLikesVisible] = useState(false);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [overlayData, setOverlayData] = useState({});
    const [paused, setPaused] = useState(false);
    const [playPauseVisible, setPlayPauseVisible] = useState('none');
    const [tabBarVisible, setTabBarVisible] = useState(true);

    // Upload context hooks
    const [s3Client, setS3Client] = useState(null);

    useEffect(() => {
        (async () => {
            await initServices();
            await authenticateUser();
        })()
    }, []);

    useEffect(() => {
        if (reelayDBUser?.sub) {
            loadMyProfile();
        }
    }, [reelayDBUser]);

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
        await loadFonts();
        await checkIsNewUser();
    }

    const checkIsNewUser = async () => {
        try {
			const value = await AsyncStorage.getItem("isReturningUser");
			if (value !== null) {
                setIsReturningUser(true);
            }
            else {
                setIsReturningUser(false);
            }
		} catch (e) {
			console.log(e)
		}
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
            logAmplitudeEventProd('s3InitializeError', {
                error: error.message,
                credentials: credentials
            });
        }
    }

    const loadFonts = async () => {
        await Font.loadAsync({
			"Outfit-Thin": require("./assets/fonts/Outfit-Thin.ttf"),
			"Outfit-ExtraLight": require("./assets/fonts/Outfit-ExtraLight.ttf"),
			"Outfit-Light": require("./assets/fonts/Outfit-Light.ttf"),
			"Outfit-Regular": require("./assets/fonts/Outfit-Regular.ttf"),
			"Outfit-Medium": require("./assets/fonts/Outfit-Medium.ttf"),
			"Outfit-SemiBold": require("./assets/fonts/Outfit-SemiBold.ttf"),
			"Outfit-Bold": require("./assets/fonts/Outfit-Bold.ttf"),
			"Outfit-ExtraBold": require("./assets/fonts/Outfit-ExtraBold.ttf"),
			"Outfit-Black": require("./assets/fonts/Outfit-Black.ttf"),
		});
    }
    let authenticationObject = {
        session: session,
        username: cognitoUser?.attributes?.sub,
        signedIn: signedIn,
        credentials: credentials,
        isLoading: isLoading,
        isReturningUser: isReturningUser,
    };

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

                const myReelayDBUser = await getRegisteredUser(cognitoUser?.attributes?.sub);
                setReelayDBUser(myReelayDBUser);
            }
        } catch (error) {
            console.log(error);
            logAmplitudeEventProd('authErrorForAuthenticateUser', {
                error: error,
                authenticationObject: authenticationObject,
            });
        }
        console.log('authentication complete');
        setIsLoading(false);
        logAmplitudeEventProd('authenticationComplete', {
            session: session,
            username: cognitoUser?.attributes?.sub,
            credentials: credentials,
            signedIn: signedIn,
        });
    }

    const loadMyProfile = async () => {
        if (signedIn && reelayDBUser && reelayDBUser.sub) {
            const nextMyFollowers = await getFollowers(reelayDBUser.sub);
            const nextMyFollowing = await getFollowing(reelayDBUser.sub);
            const nextMyCreatorStacks = await getStacksByCreator(reelayDBUser.sub);
    
            setMyFollowers(nextMyFollowers);
            setMyFollowing(nextMyFollowing);
            setMyCreatorStacks(nextMyCreatorStacks);
        }
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
                return;
            }

            const devicePushToken = await registerForPushNotificationsAsync();
            if (!registeredUser.pushToken || registeredUser.pushToken !== devicePushToken) {
                console.log('Registering new push token');
                await registerPushTokenForUser(registeredUser, devicePushToken);
                logAmplitudeEventProd('pushTokenRegistered', {
                    registeredUser: registeredUser,
                    devicePushToken: devicePushToken,
                });
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
        myFollowers,        setMyFollowers,
        myFollowing,        setMyFollowing,
        myCreatorStacks,    setMyCreatorStacks,
        reelayDBUser,       setReelayDBUser,
        session,            setSession,
        signedIn,           setSignedIn,
        username,           setUsername,
        isReturningUser,    setIsReturningUser
    }

    const uploadState = {
        s3Client,           setS3Client,
    }

    const feedState = {
        commentsVisible,    setCommentsVisible,
        currentComment,     setCurrentComment,
        dotMenuVisible,     setDotMenuVisible,
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