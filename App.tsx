// react imports
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// aws imports
import { Amplify, Auth } from 'aws-amplify';
import config from "./src/aws-video-exports";

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

console.log("AMPLIFY CONFIG OBJECT");
console.log(config);

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
        setSignedIn(true);
      });

    Auth.currentAuthenticatedUser()
      .then((user) => {
        console.log(user);
        setUser(user);
      })
      .catch((error) => {
        console.log(error);
        setSignedIn(true);
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
        setSignedIn(true);
      });
  }, []);

  const authState = {
    credentials: credentials,
    isLoading: true,
    session: session,
    signedIn: true,
    user: {
      email: "prakashsanker1@gmail.com",
    },
    username: username,

    setCredentials: setCredentials,
    setIsLoading: setIsLoading,
    setSession: setSession,
    setSignedIn: setSignedIn,
    setUser: setUser,
    setUsername: setUsername,
  }

  //@anthony this code structure is pretty good - but I think you can improve it like so
  /*

  if (isLoading) {
    return <Spinner />
  }
  return (
    user ? <AuthenticatedApp/> : <UnauthenticatedApp />
  )

    Then have your AuthenticatedApp hold all of the routes that you need for an authenticated user (and vice versa)

    You might also want to have a few functions that are accessible everywhere via context, for example logout, to make things easier.


  */

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