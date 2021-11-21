/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

export type RootStackParamList = {
    Authenticated: undefined;
    Unauthenticated: undefined;
    NotFound: undefined;
};

export type AppStackParamList = {
    BottomTab: undefined;
    TitleDetailScreen: undefined;
    VenueSelectScreen: undefined;
    ReelayCameraScreen: undefined;
    ReelayUploadScreen: undefined;
};

export type BottomTabParamList = {
    Home: undefined;
    Search: undefined;
    Create: undefined;
    Profile: undefined;
};

export type HomeTabParamList = {
    HomeFeedScreen: undefined;
    ProfileFeedScreen: undefined;
    UserProfileScreen: undefined;
    TitleDetailScreen: undefined;
    TitleFeedScreen: undefined;
    TitleTrailerScreen: undefined;
};

export type SearchTabParamList = {
    ProfileFeedScreen: undefined;
    SearchScreen: undefined;
    TitleDetailScreen: undefined;
    TitleFeedScreen: undefined;
    TitleTrailerScreen: undefined;
    UserProfileScreen: undefined;
};

export type CreateReelayTabParamList = {
    ReelayCameraScreen: undefined;
    ReelayUploadScreen: undefined;
    SelectTitleScreen: undefined;
    VenueSelectScreen: undefined;
}

export type ProfileTabParamList = {
    MyProfileScreen: undefined;
    NotificationSettingsScreen: undefined;
    ProfileFeedScreen: undefined;
    ProfileSettingsScreen: undefined;
    TitleDetailScreen: undefined;
    TitleFeedScreen: undefined;
    TitleTrailerScreen: undefined;
    UserProfileScreen: undefined;
}

export type AuthenticationStackParamList = {
    ConfirmEmailScreen: undefined;
    ForgotPasswordScreen: undefined;
    ForgotPasswordSubmitScreen: undefined;
    ForgotPasswordAffirmScreen: undefined;
    SplashScreen: undefined;
    SignInScreen: undefined;
    SignUpScreen: undefined;
    SignUpEmailScreen: undefined;
    SignUpUsernameScreen: undefined;
}