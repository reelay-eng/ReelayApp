// react imports
import React, { useEffect, useRef, useState } from 'react';
import { Image, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './navigation';
import styled from 'styled-components/native';

// aws imports
import { Amplify, Auth, Storage } from 'aws-amplify';
import { Audio } from 'expo-av';
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
import { 
    getFollowers, 
    getFollowing, 
    getFollowRequests,
    getRegisteredUser, 
    registerUser, 
    registerPushTokenForUser, 
} from './api/ReelayDBApi';
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
    const [cognitoUser, setCognitoUser] = useState({});
    const [credentials, setCredentials] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [followRequests, setFollowRequests] = useState([]);
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
        if (reelayDBUser?.sub) {
            loadUserFollows();
        }
    }, [reelayDBUser]);

    useEffect(() => {
        registerUserAndPushTokens();
        Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
            interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        });
    }, [cognitoUser]);

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

    const loadUserFollows = async () => {
        if (signedIn && reelayDBUser && reelayDBUser.sub) {
            const nextFollowers = await getFollowers(reelayDBUser.sub);
            const nextFollowing = await getFollowing(reelayDBUser.sub);
            const nextFollowReq = await getFollowRequests(reelayDBUser.sub);
    
            setFollowers(nextFollowers);
            setFollowing(nextFollowing);
            setFollowRequests(nextFollowReq);    
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

            return () => {
                Notifications.removeNotificationSubscription(notificationListener.current);
                Notifications.removeNotificationSubscription(responseListener.current);
            }   
        } catch (error) {
            console.log(error);
        }
    }

    const authState = {
        cognitoUser,        setCognitoUser,
        credentials,        setCredentials,
        expoPushToken,      setExpoPushToken,
        isLoading,          setIsLoading,
        followers,          setFollowers,
        following,          setFollowing,
        followRequests,     setFollowRequests,
        reelayDBUser,       setReelayDBUser,
        session,            setSession,
        signedIn,           setSignedIn,
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