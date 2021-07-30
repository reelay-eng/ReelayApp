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
  Create: undefined;
};

export type HomeTabParamList = {
  HomeFeedScreen: undefined;
  AccountScreen: undefined;
};

export type CreateReelayTabParamList = {
  SelectTitleScreen: undefined;
  ReelayCameraScreen: undefined;
  ReelayUploadScreen: undefined;
}

export type AuthenticationStackParamList = {
  SplashScreen: undefined;
  SignUpScreen: undefined;
  SignUpEmailScreen: undefined;
  ConfirmEmailScreen: undefined;
  SignInScreen: undefined;
  ForgotPasswordScreen: undefined;
  ForgotPasswordSubmitScreen: undefined;
  ForgotPasswordAffirmScreen: undefined;
}