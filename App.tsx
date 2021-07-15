// react imports
import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// aws imports
import { Amplify, Auth } from 'aws-amplify';
import config from "./src/aws-exports";

// auth imports
import { AuthContext } from './context/AuthContext';

// expo imports
import { StatusBar } from 'expo-status-bar';

// redux imports
import store from './redux/store';
import { Provider } from 'react-redux';

// local imports
import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

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
  const [isLoading, setIsLoading] = useState(true);
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
    
    console.log('authentication complete');
    setIsLoading(false);
  }, []);

  const authState = {
    credentials: credentials,
    isLoading: true,
    session: session,
    signedIn: true,
    user: user,
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

  if (isLoading) {
    return <ActivityIndicator />;
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