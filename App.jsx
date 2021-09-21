// react imports
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// notifications
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

// aws imports
import { Amplify, Auth, Storage } from 'aws-amplify';
import * as Amplitude from 'expo-analytics-amplitude';
import config from "./src/aws-exports";

// context imports
import { AuthContext } from './context/AuthContext';
import { VisibilityContext } from './context/VisibilityContext';
import { UploadContext } from './context/UploadContext';

// expo imports
import { StatusBar } from 'expo-status-bar';

// local imports
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

Amplify.configure({
    ...config,
    Auth: {
        identityPoolId: 'us-west-2:61470270-38e1-452f-a8ee-dd37dd80e5a4',
        region: 'us-west-2',
        userPoolId: 'us-west-2_RMWuJQRNL',
        userPoolWebClientId: '6rp2id41nvvm1sb8nav9jsrchi',
    },
        Analytics: {
        disabled: true,
    },
});

Auth.configure({ 
    mandatorySignIn: false,
});

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

Storage.configure({ 
    level: 'public',
});

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
    // TODO: this is really all about feed visibility...
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [currentComment, setCurrentComment] = useState('');
    const [likesVisible, setLikesVisible] = useState(false);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [overlayData, setOverlayData] = useState({});
    const [tabBarVisible, setTabBarVisible] = useState(true);

    // Upload context hooks
    const [uploading, setUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);
    const [chunksUploaded, setChunksUploaded] = useState(0);
    const [chunksTotal, setChunksTotal] = useState(0);
    const [uploadTitleObject, setUploadTitleObject] = useState({});
    const [uploadOptions, setUploadOptions] = useState({});
    const [uploadErrorStatus, setUploadErrorStatus] = useState(false);
    const [uploadVideoSource, setUploadVideoSource] = useState('');
    const [venueSelected, setVenueSelected] = useState('');

    Amplitude.initializeAsync('41cdcb8df4bfc40ab39155a7e3401d22');

    useEffect(() => {
        authenticateUser();

        // notification setup
        // https://docs.expo.dev/versions/latest/sdk/notifications/ 
        registerForPushNotificationsAsync();
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
    }, []);

    const authenticateUser = async () => {
        console.log('Setting up authentication');

        Auth.currentSession().then((session) => {
                setSession(session);
        }).catch((error) => {
            console.log(error);
        });

        Auth.currentAuthenticatedUser().then((user) => {
            setUser(user);
            setSignedIn(true);
            Amplitude.logEventWithPropertiesAsync('login', {
                username: user.username,
            });    
        }).catch((error) => {
            console.log(error);
        });

        Auth.currentUserCredentials().then((credentials) => {
            setCredentials(credentials);
            setSignedIn(credentials.authenticated);
        }).catch((error) => {
            console.log(error);
        });
        console.log('authentication complete');
        setIsLoading(false);
    }

    // https://docs.expo.dev/push-notifications/push-notifications-setup/
    const registerForPushNotificationsAsync = async () => {
        if (Constants.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            const token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log(token);
            setExpoPushToken(token);
        } else {
            alert('Must use physical device for Push Notifications');
        }
        
        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }
    }; 
      
    const authState = {
        credentials, setCredentials,
        expoPushToken, setExpoPushToken,
        isLoading, setIsLoading,
        session, setSession,
        signedIn, setSignedIn,
        user, setUser,
        username, setUsername,
    }

    const vizState = {
        commentsVisible, setCommentsVisible,
        currentComment, setCurrentComment,
        likesVisible, setLikesVisible,
        overlayData, setOverlayData,
        overlayVisible, setOverlayVisible,
        tabBarVisible, setTabBarVisible,
    }

    const uploadState = {
        uploading, setUploading,
        uploadComplete, setUploadComplete,
        chunksUploaded, setChunksUploaded,
        chunksTotal, setChunksTotal,
        uploadTitleObject, setUploadTitleObject,
        uploadOptions, setUploadOptions,
        uploadErrorStatus, setUploadErrorStatus,
        uploadVideoSource, setUploadVideoSource,
        venueSelected, setVenueSelected,
    }

    if (isLoading) {
        return (
            <SafeAreaView>
                <ActivityIndicator />
            </SafeAreaView>
        );
    } else {
        return (
            <SafeAreaProvider>
                <AuthContext.Provider value={authState}>
                    <VisibilityContext.Provider value={vizState}>
                    <UploadContext.Provider value={uploadState}>
                        <StatusBar hidden={true} />
                        <Navigation colorScheme={colorScheme} />
                    </UploadContext.Provider>
                    </VisibilityContext.Provider>
                </AuthContext.Provider>
            </SafeAreaProvider>
        );
    }
}

export default App;