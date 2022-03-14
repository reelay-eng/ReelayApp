// react imports
import React, { useEffect, useRef, useState } from 'react';
import { Image, Text, View, Pressable } from 'react-native';
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
import { getRegisteredUser, registerUser, registerPushTokenForUser } from './api/ReelayDBApi';
import { registerForPushNotificationsAsync } from './api/NotificationsApi';
import { toastConfig } from './components/utils/ToastConfig';
import Toast from "react-native-toast-message";

import { 
    loadMyFollowers, 
    loadMyFollowing, 
    loadMyReelayStacks, 
    loadMyNotifications, 
    loadMyWatchlist, 
    verifySocialAuthToken,
} from './api/ReelayUserApi';

// font imports
import * as Font from 'expo-font';

const SPLASH_IMAGE_SOURCE = require('./assets/images/reelay-splash-with-dog.png');

function App() {
    const colorScheme = useColorScheme();

    // Auth context hooks
    const [cognitoUser, setCognitoUser] = useState({});
    const [credentials, setCredentials] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isReturningUser, setIsReturningUser] = useState(false);

    const [myCreatorStacks, setMyCreatorStacks] = useState([]);
    const [myFollowers, setMyFollowers] = useState([]);
    const [myFollowing, setMyFollowing] = useState([]);
    const [myNotifications, setMyNotifications] = useState([]);
    const [myWatchlistItems, setMyWatchlistItems] = useState([]);

    const [reelayDBUser, setReelayDBUser] = useState({});
    const [reelayDBUserID, setReelayDBUserID] = useState(null);
    const [signedIn, setSignedIn] = useState(false);
    const [signUpFromGuest, setSignUpFromGuest] = useState(false);

    // Feed context hooks
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [currentComment, setCurrentComment] = useState('');
    const [dotMenuVisible, setDotMenuVisible] = useState(false);
    const [justShowMeSignupVisible, setJustShowMeSignupVisible] = useState(false);
    const [likesVisible, setLikesVisible] = useState(false);
    const [paused, setPaused] = useState(false);
    const [playPauseVisible, setPlayPauseVisible] = useState('none');
    const [tabBarVisible, setTabBarVisible] = useState(true);

    // Upload context hooks
    const [s3Client, setS3Client] = useState(null);

    useEffect(() => {
        (async () => {
            await initServices();
            await autoAuthenticateUser(); // this should just update cognitoUser
        })()
    }, []);

    /**
     * The following useEffect statements are set up to allow EITHER
     * a cognito identity OR a social auth identity to log in a user and
     * load their profile. Both do this by setting reelayDBUserID, which in
     * turn loads the whole profile and signs the user in.
     */

    useEffect(() => {
        if (reelayDBUserID) loadMyProfile(reelayDBUserID);
    }, [reelayDBUserID]);

    useEffect(() => {
        if (cognitoUser?.attributes?.sub) {
            setReelayDBUserID(cognitoUser?.attributes?.sub);
        }
    }, [cognitoUser]);

    useEffect(() => {
        if (reelayDBUser?.sub) {
            setSignedIn(true);
            registerMyPushToken();
        }
    }, [reelayDBUser]);

    const autoAuthenticateUser = async () => {
        console.log('Setting up authentication');
        let tryCredentials, tryCognitoUser, tryVerifySocialAuth;
        try {
            tryCredentials = await Auth.currentUserCredentials();
            if (tryCredentials?.authenticated) {
                // use cognito to sign in the user
                tryCognitoUser = await Auth.currentAuthenticatedUser();
                setCognitoUser(tryCognitoUser);
                if (tryCognitoUser?.username === 'be_our_guest') {
                    setSignUpFromGuest(true);
                } else {
                    setSignUpFromGuest(false);
                }
            } else {
                // try using a social auth token to sign in the user
                const authTokenJSON = await AsyncStorage.getItem('mySocialAuthToken');
                if (authTokenJSON) {
                    const { reelayDBUserID, token } = JSON.parse(authTokenJSON);
                    tryVerifySocialAuth = await verifySocialAuthToken();
                    if (tryVerifySocialAuth?.success) {
                        console.log('Auto authentication from social login successful');
                        setReelayDBUserID(reelayDBUserID);
                    }
                }
            }
            logAmplitudeEventProd('authenticationComplete', {
                hasValidCredentials: tryCredentials?.authenticated,
                username: tryCognitoUser?.attributes?.sub,
            });        

        } catch (error) {
            logAmplitudeEventProd('authErrorForAuthenticateUser', {
                error: error,
                hasValidCredentials: tryCredentials?.authenticated,
                username: tryCognitoUser?.username,
            });
        }

        if (!tryCredentials?.authenticated && !tryVerifySocialAuth?.success) {
            setIsLoading(false);
            // else, keep loading until loadMyProfile finishes
        }
    }

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

    const loadMyProfile = async (userSub) => {
        const reelayDBUserLoaded = await getRegisteredUser(userSub);
        const myCreatorStacksLoaded = await loadMyReelayStacks(userSub);
        const myFollowersLoaded = await loadMyFollowers(userSub);
        const myFollowingLoaded = await loadMyFollowing(userSub);
        const myNotifications = await loadMyNotifications(userSub);
        const myWatchlistItemsLoaded = await loadMyWatchlist(userSub);

        setReelayDBUser(reelayDBUserLoaded);
        setMyFollowers(myFollowersLoaded);
        setMyFollowing(myFollowingLoaded);
        setMyCreatorStacks(myCreatorStacksLoaded);
        setMyNotifications(myNotifications);
        setMyWatchlistItems(myWatchlistItemsLoaded);
        setIsLoading(false);
    }

    const registerMyPushToken = async () => {
        try {
            if (reelayDBUser?.username === 'be_our_guest') return;
            const devicePushToken = await registerForPushNotificationsAsync();
            if (!devicePushToken) return;

            if (!reelayDBUser.pushToken || reelayDBUser.pushToken !== devicePushToken) {
                console.log('Registering new push token');
                await registerPushTokenForUser(reelayDBUser.sub, devicePushToken);
                logAmplitudeEventProd('pushTokenRegistered', {
                    registeredUser: reelayDBUser,
                    devicePushToken: devicePushToken,
                });
            }    
        } catch (error) {
            console.log(error);
        }
    }

    const authState = {
        cognitoUser,        setCognitoUser,
        credentials,        setCredentials,
        isLoading,          setIsLoading,
        isReturningUser,    setIsReturningUser,

        myCreatorStacks,    setMyCreatorStacks,
        myFollowers,        setMyFollowers,
        myFollowing,        setMyFollowing,
        myNotifications,    setMyNotifications,
        myWatchlistItems,   setMyWatchlistItems,

        reelayDBUser,       setReelayDBUser,
        reelayDBUserID,     setReelayDBUserID,
        signedIn,           setSignedIn,
        signUpFromGuest,    setSignUpFromGuest,
    }

    const uploadState = {
        s3Client,           setS3Client,
    }

    const feedState = {
        commentsVisible,    setCommentsVisible,
        currentComment,     setCurrentComment,
        dotMenuVisible,     setDotMenuVisible,
        justShowMeSignupVisible, setJustShowMeSignupVisible,
        likesVisible,       setLikesVisible,
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
                            <Toast config={toastConfig}/>
                        </UploadContext.Provider>
                    </FeedContext.Provider>
                </AuthContext.Provider>
            </SafeAreaProvider>
        );
    }
}

export default App;
