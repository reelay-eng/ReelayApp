/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

export default {
    // prefixes: [Linking.makeUrl('/')],
    prefixes: ['reelay://'],
    config: {
        screens: {
            Authenticated: {
                screens: {
                    HomeFeedScreen: 'HomeFeedScreen',
                    SelectTitleScreen: 'SelectTitleScreen',
                    ReelayCameraScreen: 'ReelayCameraScreen',
                    ReelayUploadScreen: 'ReelayUploadScreen',
                    VenueSelectScreen: 'VenueSelectScreen',
                    MyProfileScreen: 'MyProfileScreen',
                    ProfileSettingsScreen: 'ProfileSettingsScreen',
                    ProfileFeedScreen: 'ProfileFeedScreen',
                },
            },
            Unauthenticated: {
                screens: {
                    ConfirmEmailScreen: 'ConfirmEmailScreen',
                    ForgotPasswordAffirmScreen: 'ForgotPasswordAffirmScreen',
                    ForgotPasswordScreen: 'ForgotPasswordScreen',
                    ForgotPasswordSubmitScreen: 'ForgotPasswordSubmitScreen',
                    SignInScreen: 'SignInScreen',
                    SignUpEmailScreen: 'SignUpEmailScreen',
                    SignUpScreen: 'SignUpScreen',
                    SignUpUsernameScreen: 'SignUpUsernameScreen',
                    SplashScreen: 'SplashScreen',
                },
            },
            NotFound: '*',
        },
    },
};
