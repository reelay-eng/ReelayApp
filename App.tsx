// react imports
import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// aws imports
import { Amplify, Auth, Storage } from 'aws-amplify';
import config from "./src/aws-exports";

// context imports
import { AuthContext } from './context/AuthContext';
import { VisibilityContext } from './context/VisibilityContext';

// expo imports
import { StatusBar } from 'expo-status-bar';

// redux imports
import store from './redux/store';
import { Provider } from 'react-redux';

// local imports
import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

Amplify.configure({
  ...config,
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
      setOverlayVisible: setOverlayVisible,
      setOverlayData: setOverlayData,
  }

  if (isLoading) {
    return <ActivityIndicator />;
  } else {
    return (
      <SafeAreaProvider>
        <AuthContext.Provider value={authState}>
          <VisibilityContext.Provider value={visibilityState}>
            <Provider store={store}>
              <StatusBar hidden={true} />
              <Navigation colorScheme={colorScheme} />
            </Provider>
          </VisibilityContext.Provider>
        </AuthContext.Provider>
      </SafeAreaProvider>
    );
  }
}

export default App;