// react imports
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// aws imports
import { Amplify, Auth } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from 'aws-amplify-react-native';
import config from "./src/aws-exports";

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


// Amplify.configure({
//   ...config,
//   Analytics: {
//     disabled: true,
//   },
// });

Auth.configure({ mandatorySignIn: false});

function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Provider store={store}>
          <Navigation colorScheme={colorScheme} />
          <StatusBar />
        </Provider>
      </SafeAreaProvider>
    );
  }
}

export default withAuthenticator(App, true);
// export default App;