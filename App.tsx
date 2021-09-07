// react imports
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AppRegistry, SafeAreaView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
import useCachedResources from './hooks/useCachedResources';
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
Auth.configure({ mandatorySignIn: false});
Storage.configure({ level: 'public' });

function App() {
  const colorScheme = useColorScheme();

  const [credentials, setCredentials] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [session, setSession] = useState({});
  const [user, setUser] = useState({});
  const [username, setUsername] = useState('');

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayData, setOverlayData] = useState({});
  const [tabBarVisible, setTabBarVisible] = useState(true);

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

    console.log('Setting up authentication');
    Auth.currentSession()
      .then((session) => {
        setSession(session);
      })
      .catch((error) => {
        console.log(error);
      });

    Auth.currentAuthenticatedUser()
      .then((user) => {
        setUser(user);
        setSignedIn(true);

        Amplitude.logEventWithPropertiesAsync('login', {
          username: user.username,
        });    
      })
      .catch((error) => {
        console.log(error);
      });

    Auth.currentUserCredentials()
      .then((credentials) => {
        setCredentials(credentials);
        setSignedIn(credentials.authenticated);
      })
      .catch((error) => {
        console.log(error);
      });
    
    console.log('authentication complete');
    setIsLoading(false);

  }, []);

  const authState = {
    credentials: credentials,
    isLoading: true,
    session: session,
    signedIn: signedIn,
    user: user,
    username: username,

    setCredentials: setCredentials,
    setIsLoading: setIsLoading,
    setSession: setSession,
    setSignedIn: setSignedIn,
    setUser: setUser,
    setUsername: setUsername,
  }

  const visibilityState = {
      overlayVisible: overlayVisible,
      overlayData: overlayData,
      tabBarVisible: tabBarVisible,
      setOverlayVisible: setOverlayVisible,
      setOverlayData: setOverlayData,
      setTabBarVisible: setTabBarVisible,
  }

  const uploadState = {
    uploading: uploading,
    uploadComplete: uploadComplete,
    chunksUploaded: chunksUploaded,
    chunksTotal: chunksTotal,
    uploadTitleObject: uploadTitleObject,
    uploadOptions: uploadOptions,
    uploadErrorStatus: uploadErrorStatus,
    uploadVideoSource: uploadVideoSource,
    venueSelected: venueSelected,

    setUploading: setUploading,
    setUploadComplete: setUploadComplete,
    setChunksUploaded: setChunksUploaded,
    setChunksTotal: setChunksTotal,
    setUploadTitleObject: setUploadTitleObject,
    setUploadOptions: setUploadOptions,
    setUploadErrorStatus: setUploadErrorStatus,
    setUploadVideoSource: setUploadVideoSource,
    setVenueSelected: setVenueSelected,
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
            <VisibilityContext.Provider value={visibilityState}>
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