/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

export type RootStackParamList = {
    Authenticated: undefined;
    Unauthenticated: undefined;
    NotFound: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Search: undefined;
  Create: undefined;
  Profile: undefined;
};

export type HomeTabParamList = {
    HomeFeedScreen: undefined;
    UserProfileScreen: undefined;
    ProfileFeedScreen: undefined;
};

export type CreateReelayTabParamList = {
    SelectTitleScreen: undefined;
    ReelayCameraScreen: undefined;
    ReelayUploadScreen: undefined;
    VenueSelectScreen: undefined;
}

export type ProfileTabParamList = {
    MyProfileScreen: undefined;
    UserProfileScreen: undefined;
    ProfileFeedScreen: undefined;
    ProfileSettingsScreen: undefined;
    NotificationSettingsScreen: undefined;
}

export type AuthenticationStackParamList = {
    SplashScreen: undefined;
    SignUpScreen: undefined;
    SignUpEmailScreen: undefined;
    SignUpUsernameScreen: undefined;
    ConfirmEmailScreen: undefined;
    SignInScreen: undefined;
    ForgotPasswordScreen: undefined;
    ForgotPasswordSubmitScreen: undefined;
    ForgotPasswordAffirmScreen: undefined;
}