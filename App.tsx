// react imports
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AppRegistry } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

// monitoring imports
import * as Sentry from 'sentry-expo';

// aws imports
import { Amplify, Auth, Storage } from 'aws-amplify';
import config from "./src/aws-exports";

// context imports
import { AuthContext } from './context/AuthContext';
import { VisibilityContext } from './context/VisibilityContext';
import { UploadContext } from './context/UploadContext';

// expo imports
import { StatusBar } from 'expo-status-bar';

// redux imports
import store from './redux/store';
import { Provider } from 'react-redux';

// local imports
import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

Sentry.init({
  dsn: "https://6eca784356434bc487b3a34f54011754@o943219.ingest.sentry.io/5892020",
  environment: Constants.manifest?.extra?.sentryEnvironment,
  enableInExpoDevelopment: true,
  debug: true,
});

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
  const isLoadingComplete = useCachedResources();
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
        Sentry.Native.setUser({
          email: user.attributes.email,
          username: user.username,
          id: user.attributes.sub,
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

    setUploading: setUploading,
    setUploadComplete: setUploadComplete,
    setChunksUploaded: setChunksUploaded,
    setChunksTotal: setChunksTotal,
    setUploadTitleObject: setUploadTitleObject,
    setUploadOptions: setUploadOptions,
    setUploadErrorStatus: setUploadErrorStatus,
    setUploadVideoSource: setUploadVideoSource,
  }

  if (isLoading) {
    return <ActivityIndicator />;
  } else {
    return (
      <Sentry.Native.TouchEventBoundary>
        <SafeAreaProvider>
          <AuthContext.Provider value={authState}>
            <VisibilityContext.Provider value={visibilityState}>
              <UploadContext.Provider value={uploadState}>
                <Provider store={store}>
                  <StatusBar hidden={true} />
                  <Navigation colorScheme={colorScheme} />
                </Provider>
              </UploadContext.Provider>
            </VisibilityContext.Provider>
          </AuthContext.Provider>
        </SafeAreaProvider>
      </Sentry.Native.TouchEventBoundary>
    );
  }
}

export default App;
// export default AppRegistry.registerComponent("Reelay", () => App);
