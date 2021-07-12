// react imports
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// aws imports
import { Amplify, Auth } from 'aws-amplify';
import config from "./src/aws-exports";

// auth imports
import { AuthContext } from './context/AuthContext';

// expo imports
import { StatusBar } from 'expo-status-bar';
import * as WebBrowswer from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

// redux imports
import store from './redux/store';
import { Provider } from 'react-redux';

// local imports
import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import { TabRouter } from '@react-navigation/native';


Amplify.configure({
  ...config,
  Analytics: {
    disabled: true,
  },
});

Auth.configure({ mandatorySignIn: false});

function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  const [credentials, setCredentials] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [session, setSession] = useState({});
  const [user, setUser] = useState({});
  const [username, setUsername] = useState('');

  useEffect(() => {
    console.log('Setting up authentication');
    Auth.currentSession()
      .then((session) => {
        console.log(session);
        setSession(session);
      })
      .catch((error) => {
        console.log(error);
        setSignedIn(false);
      });

    Auth.currentAuthenticatedUser()
      .then((user) => {
        console.log(user);
        setUser(user);
      })
      .catch((error) => {
        console.log(error);
        setSignedIn(false);
      });

    Auth.currentUserCredentials()
      .then((credentials) => {
        console.log(credentials);
        setCredentials(credentials);
        setSignedIn(credentials.authenticated);
        console.log("Signed in? ", credentials.authenticated);
        console.log(authState);
      })
      .catch((error) => {
        console.log(error);
        setSignedIn(false);
      });
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

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <AuthContext.Provider value={authState}>
          <Provider store={store}>
            <StatusBar hidden={true} />
            <Navigation colorScheme={colorScheme} />
          </Provider>
        </AuthContext.Provider>
      </SafeAreaProvider>
    );
  }
}

export default App;