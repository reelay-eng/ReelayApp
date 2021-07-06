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
      Root: {
        screens: {
          Home: {
            screens: {
              HomeFeedScreen: 'one',
            },
          },
          Reelay: {
            screens: {
              RecordReelayScreen: 'two',
            },
          },
          CreateReelay: {
            screens: {
              CreateReelayScreen: 'three',
            },
          },
        },
      },
      Auth: {
        screens: {
          SplashScreen: 'SplashScreen',
          SignUpScreen: 'SignUpScreen',
          SignInScreen: 'SignInScreen',
          ConfirmEmailScreen: 'ConfirmEmailScreen',
          ForgotPasswordScreen: 'ForgotPasswordScreen',
        },
      },
      NotFound: '*',
    },
  },
};
