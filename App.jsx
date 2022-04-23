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

// api imports
import { getFeed, getAllDonateLinks, getRegisteredUser, registerPushTokenForUser } from './api/ReelayDBApi';
import { registerForPushNotificationsAsync } from './api/NotificationsApi';
import { toastConfig } from './components/utils/ToastConfig';
import Toast from "react-native-toast-message";

import { 
    loadMyFollowers, 
    loadMyFollowing, 
    loadMyReelayStacks, 
    loadMyNotifications, 
    loadMyStreamingSubscriptions,
    loadMyWatchlist, 
    verifySocialAuthToken,
} from './api/ReelayUserApi';

// font imports
import * as Font from 'expo-font';
import { connect, Provider, useDispatch, useSelector } from 'react-redux';
import store, { mapStateToProps } from './redux/store';
import { ensureLocalImageDirExists } from './api/ReelayLocalImageCache';
import { ensureLocalTitleDirExists } from './api/ReelayLocalTitleCache';

const SPLASH_IMAGE_SOURCE = require('./assets/images/reelay-splash-with-dog.png');

function App() {
    const colorScheme = useColorScheme();
    const dispatch = useDispatch();
    const credentials = useSelector(state => state.credentials);
    const isLoading = useSelector(state => state.isLoading);

    // Auth context hooks
    const [cognitoUser, setCognitoUser] = useState({});
    const [reelayDBUser, setReelayDBUser] = useState({});
    const [reelayDBUserID, setReelayDBUserID] = useState(null);

    useEffect(() => {
        initReelayApp();
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
            dispatch({ type: 'setSignedIn', payload: true });
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
                    dispatch({ type: 'setSignUpFromGuest', payload: true });
                } else {
                    dispatch({ type: 'setSignUpFromGuest', payload: false });
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
            dispatch({ type: 'setIsLoading', payload: false });
            // else, keep loading until loadMyProfile finishes
        }
    }

    const initReelayApp = async () => {
        await initServices();
        await autoAuthenticateUser();
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
        await ensureLocalImageDirExists();
        await ensureLocalTitleDirExists();
    }

    const checkIsNewUser = async () => {
        try {
			const value = await AsyncStorage.getItem("isReturningUser");
			if (value !== null) {
                dispatch({ type: 'setIsReturningUser', payload: true });
            }
            else {
                dispatch({ type: 'setIsReturningUser', payload: false });
            }
		} catch (error) {
			console.log(error);
		}
    }

    const initS3Client = () => {
        try {
            setupURLPolyfill();            
            const newS3Client = new S3Client({
                region: AWSExports.aws_project_region,
                credentials: fromCognitoIdentityPool({
                    client: new CognitoIdentityClient({ 
                        region: AWSExports.aws_cognito_region 
                    }),
                    identityPoolId: AWSExports.aws_cognito_identity_pool_id,
                }),
            });
            dispatch({ type: 'setS3Client', payload: newS3Client });
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
        const reqUserSub = userSub;
        // make sure to maintain consistent ordering between these arrays
        // when you modify them
        const [
            reelayDBUserLoaded,
            myCreatorStacksLoaded,
            myFollowersLoaded,
            myFollowingLoaded,
            myNotificationsLoaded,
            myWatchlistItemsLoaded,
            myStreamingSubscriptions,
            donateLinksLoaded,

            myStacksFollowing,
            myStacksInTheaters,
            myStacksOnStreaming,
            myStacksAtFestivals,
            topOfTheWeek,
        ] = await Promise.all([
            getRegisteredUser(userSub),
            loadMyReelayStacks(userSub),
            loadMyFollowers(userSub),
            loadMyFollowing(userSub),
            loadMyNotifications(userSub),
            loadMyWatchlist(userSub),
            loadMyStreamingSubscriptions(userSub),
            getAllDonateLinks(),

            getFeed({ reqUserSub, feedSource: 'following', page: 0 }),
            getFeed({ reqUserSub, feedSource: 'theaters', page: 0 }),
            getFeed({ reqUserSub, feedSource: 'streaming', page: 0 }),
            getFeed({ reqUserSub, feedSource: 'festivals', page: 0 }),
            getFeed({ reqUserSub, feedSource: 'trending', page: 0 }),
        ]);

        setReelayDBUser(reelayDBUserLoaded);
        dispatch({ type: 'setMyFollowers', payload: myFollowersLoaded });
        dispatch({ type: 'setMyCreatorStacks', payload: myCreatorStacksLoaded });

        dispatch({ type: 'setMyFollowing', payload: myFollowingLoaded });
        dispatch({ type: 'setMyNotifications', payload: myNotificationsLoaded });
        dispatch({ type: 'setMyWatchlistItems', payload: myWatchlistItemsLoaded });
        dispatch({ type: 'setShowFestivalsRow', payload: reelayDBUserLoaded?.settingsShowFilmFestivals })

        dispatch({ type: 'setMyStreamingSubscriptions', payload: myStreamingSubscriptions });
        dispatch({ type: 'setDonateLinks', payload: donateLinksLoaded });
        dispatch({ type: 'setMyStacksFollowing', payload: myStacksFollowing });
        dispatch({ type: 'setMyStacksInTheaters', payload: myStacksInTheaters });
        dispatch({ type: 'setMyStacksOnStreaming', payload: myStacksOnStreaming });
        dispatch({ type: 'setMyStacksAtFestivals', payload: myStacksAtFestivals });
        dispatch({ type: 'setTopOfTheWeek', payload: topOfTheWeek });
        dispatch({ type: 'setIsLoading', payload: false });
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
        reelayDBUser,       setReelayDBUser,
        reelayDBUserID,     setReelayDBUserID,
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
                        <StatusBar hidden={true} />
                        <Navigation colorScheme={colorScheme} />
                        <Toast config={toastConfig}/>
                </AuthContext.Provider>
            </SafeAreaProvider>
        );
    }
}

const ReduxApp = () => {
    return (
        <Provider store={store}>
            <App />
        </Provider>
    )
}

connect(mapStateToProps)(ReduxApp);
export default ReduxApp;
