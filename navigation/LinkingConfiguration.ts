/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import * as Linking from 'expo-linking';

export default {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Authenticated: {
        screens: {
          HomeFeedScreen: 'HomeFeedScreen',
          SelectTitleScreen: 'SelectTitleScreen',
          ReelayCameraScreen: 'ReelayCameraScreen',
          ReelayUploadScreen: 'ReelayUploadScreen',
          VenueSelectScreen: 'VenueSelectScreen',
          AccountScreen: 'AccountScreen',
        },
      },
      Unauthenticated: {
        screens: {
          SplashScreen: 'SplashScreen',
          SignUpEmailScreen: 'SignUpEmailScreen',
          SignUpScreen: 'SignUpScreen',
          SignInScreen: 'SignInScreen',
          ConfirmEmailScreen: 'ConfirmEmailScreen',
          ForgotPasswordScreen: 'ForgotPasswordScreen',
          ForgotPasswordSubmitScreen: 'ForgotPasswordSubmitScreen',
          ForgotPasswordAffirmScreen: 'ForgotPasswordAffirmScreen',
        },
      },
      NotFound: '*',
    },
  },
};
