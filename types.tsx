/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

export type RootStackParamList = {
  Root: undefined;
  Auth: undefined;
  NotFound: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Create: undefined;
};

export type HomeTabParamList = {
  HomeFeedScreen: undefined;
};

export type CreateReelayTabParamList = {
  SelectTitleScreen: undefined;
  ReelayCameraScreen: undefined;
  ReelayPreviewScreen: undefined;
  ReelayUploadScreen: undefined;
}

export type AuthenticationStackParamList = {
  SplashScreen: undefined;
  SignUpScreen: undefined;
  SignInScreen: undefined;
  ForgotPasswordScreen: undefined;
}