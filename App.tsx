// react imports
import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// aws imports
import { Amplify, Auth } from 'aws-amplify';
import config from "./src/aws-exports";

// auth imports
import { AuthContext } from './context/AuthContext';
import { reelaySignUp, reelaySignIn, reelaySignOut, 
  reelayResendConfirmationCode } from './api/ReelayAuthApi';

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

  const [signedIn, setSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [userToken, setUserToken] = useState('');

  const authState = {
    signedIn: signedIn,
    isLoading: isLoading,
    user: user,
    username: username,
    userToken: userToken,

    setSignedIn: setSignedIn,
    setIsLoading: setIsLoading,
    setUser: setUser,
    setUsername: setUsername,
    setUserToken: setUserToken,
  }

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <AuthContext.Provider value={authState}>
          <Provider store={store}>
            <Navigation colorScheme={colorScheme} />
            <StatusBar />
          </Provider>
        </AuthContext.Provider>
      </SafeAreaProvider>
    );
  }
}

// export default withAuthenticator(App, true);
export default App;