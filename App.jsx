// react imports
import React, { useEffect, useRef, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import { ActivityIndicator, Image, View } from 'react-native';
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
import { 
    getAllDonateLinks, 
    getRegisteredUser, 
    registerPushTokenForUser,
    getFollowers, 
    getStacksByCreator, 
    getLatestAnnouncement,
    getHomeContent,
} from './api/ReelayDBApi';
import { getAllMyNotifications } from './api/NotificationsApi';
import { getWatchlistItems } from './api/WatchlistApi';

import { registerForPushNotificationsAsync } from './api/NotificationsApi';
import { toastConfig } from './components/utils/ToastConfig';
import Toast from "react-native-toast-message";

// other imports
import * as Font from 'expo-font';
import { connect, Provider, useDispatch, useSelector } from 'react-redux';
import store, { mapStateToProps } from './redux/store';
import { ensureLocalImageDirExists, maybeFlushTitleImageCache } from './api/ReelayLocalImageCache';
import { ensureLocalTitleDirExists } from './api/ReelayLocalTitleCache';
import { fetchPopularMovies, fetchPopularSeries } from './api/TMDbApi';

const LoadingContainer = styled(View)`
    align-items: center;
    height: 100%;
    justify-content: center;
    width: 100%;
    position: absolute;
`
const SplashContainer = styled(View)`
    background-color: black;
    height: 100%;
    width: 100%;
    position: absolute;
`
const SplashImage = styled(Image)`
    height: 100%;
    width: 100%;
    position: absolute;
`

const SPLASH_IMAGE_SOURCE = require('./assets/images/reelay-splash-with-dog-black.png');

function App() {
    const colorScheme = useColorScheme();
    const dispatch = useDispatch();
    const isLoading = useSelector(state => state.isLoading);
    const authSession = useSelector(state => state.authSession);

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
        const userSub = cognitoUser?.attributes?.sub;
        if (userSub) {
            setReelayDBUserID(userSub);
            dispatch({ type: 'setReelayDBUserID', payload: userSub });
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
            Auth.currentSession();
            if (tryCredentials?.authenticated) {
                // use cognito to sign in the user
                tryCognitoUser = await Auth.currentAuthenticatedUser();
                setCognitoUser(tryCognitoUser);

                const signUpFromGuest = (tryCognitoUser?.username === 'be_our_guest');
                dispatch({ type: 'setSignUpFromGuest', payload: signUpFromGuest });

                if (!signUpFromGuest) {
                    const cognitoSession = await Auth.currentSession();
                    dispatch({ type: 'setAuthSessionFromCognito', payload: cognitoSession });    
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
        await maybeFlushTitleImageCache();
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

    const getDismissalHistory = async () => {
        const [announcementHistoryJSON, noticeHistoryJSON] = await Promise.all([
            AsyncStorage.getItem('announcement-history-json') ?? '{}',
            AsyncStorage.getItem('notice-history-json') ?? '{}',
        ])
        const announcementHistory = JSON.parse(announcementHistoryJSON);
        const noticeHistory = JSON.parse(noticeHistoryJSON);
        return { announcementHistory, noticeHistory };
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

        // initial load
        const [
            latestAnnouncement,
            myDismissalHistory,
            myHomeContent,
            reelayDBUserLoaded
        ] = await Promise.all([
            getLatestAnnouncement({ authSession, reqUserSub, page: 0 }),
            getDismissalHistory(),
            getHomeContent({ authSession, reqUserSub }),
            getRegisteredUser(userSub),
        ]);

        const myClubs = myHomeContent?.clubs ?? [];
        const { myFollowing, myStreamingSubscriptions } = myHomeContent?.profile ?? [];

        setReelayDBUser(reelayDBUserLoaded);
        dispatch({ type: 'setReelayDBUser', payload: reelayDBUserLoaded });
        dispatch({ type: 'setLatestAnnouncement', payload: latestAnnouncement });
        dispatch({ type: 'setMyDismissalHistory', payload: myDismissalHistory });
        dispatch({ type: 'setMyHomeContent', payload: myHomeContent });
        dispatch({ type: 'setMyClubs', payload: myClubs ?? [] });
        dispatch({ type: 'setMyFollowing', payload: myFollowing });
        dispatch({ type: 'setMyStreamingSubscriptions', payload: myStreamingSubscriptions });
        dispatch({ type: 'setShowFestivalsRow', payload: reelayDBUserLoaded?.settingsShowFilmFestivals })
        dispatch({ type: 'setIsLoading', payload: false });

        // deferred load
        const [
            donateLinksLoaded,
            myCreatorStacksLoaded,
            myFollowersLoaded,
            myNotificationsLoaded,
            myWatchlistItemsLoaded,
            suggestedMovies,
            suggestedSeries,
        ] = await Promise.all([
            getAllDonateLinks(),
            getStacksByCreator(userSub),
            getFollowers(userSub),
            getAllMyNotifications(userSub),
            getWatchlistItems(userSub),
            fetchPopularMovies(),
            fetchPopularSeries(),
        ])

        dispatch({ type: 'setDonateLinks', payload: donateLinksLoaded });
        dispatch({ type: 'setMyCreatorStacks', payload: myCreatorStacksLoaded });
        dispatch({ type: 'setMyFollowers', payload: myFollowersLoaded });
        dispatch({ type: 'setMyNotifications', payload: myNotificationsLoaded });
        dispatch({ type: 'setMyWatchlistItems', payload: myWatchlistItemsLoaded });

        const suggestedMovieResults = { titles: suggestedMovies, nextPage: 1 };
        const suggestedSeriesResults = { titles: suggestedSeries, nextPage: 1 };

        dispatch({ type: 'setSuggestedMovieResults', payload: suggestedMovieResults });
        dispatch({ type: 'setSuggestedSeriesResults', payload: suggestedSeriesResults });
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
        return (
            <SplashContainer>
                <SplashImage source={SPLASH_IMAGE_SOURCE} />
                <LoadingContainer>
                    <ActivityIndicator />
                </LoadingContainer>
            </SplashContainer>
        );

    } else {
        return (
            <SplashContainer>
                <LoadingContainer>
                    <ActivityIndicator />
                </LoadingContainer>
                <AuthContext.Provider value={authState}>
                    <StatusBar style="light" />
                    <Navigation colorScheme={colorScheme} />
                    <Toast config={toastConfig}/>
                </AuthContext.Provider>
            </SplashContainer>
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
