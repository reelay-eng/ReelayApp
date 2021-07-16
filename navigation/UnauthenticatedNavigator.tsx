import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthenticationStackParamList } from '../types';

import PreSignUpSSOScreen from '../screens/PreSignUpSSOScreen';
import SignUpEmailScreen from '../screens/SignUpEmailScreen';
import SignUpScreen from '../screens/SignUpScreen';
import SignInScreen from '../screens/SignInScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ForgotPasswordSubmitScreen from '../screens/ForgotPasswordSubmitScreen';
import ForgotPasswordAffirmScreen from '../screens/ForgotPasswordAffirmScreen';
import ConfirmEmailScreen from '../screens/ConfirmEmailScreen';

const AuthenticationStack = createStackNavigator<AuthenticationStackParamList>();

export default function UnauthenticatedNavigator() {
  return (
    <AuthenticationStack.Navigator
      initialRouteName="PreSignUpSSOScreen"
      detachInactiveScreens={false}
    >
      {/* <AuthenticationStack.Screen
        name="SplashScreen"
        component={SplashScreen}
      /> */}
      <AuthenticationStack.Screen
        name="PreSignUpSSOScreen"
        component={PreSignUpSSOScreen}
        options={{
          headerShown: false
        }}
      />
      <AuthenticationStack.Screen
        name="SignUpScreen"
        component={SignUpScreen}
        options={{
            headerShown: false,
        }}
      />
      <AuthenticationStack.Screen
        name="SignUpEmailScreen"
        component={SignUpEmailScreen}
        options={{
            headerShown: false,
        }}
      />
      <AuthenticationStack.Screen
        name="SignInScreen"
        component={SignInScreen}
        options={{
            headerShown: false,
        }}
      />
      <AuthenticationStack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
        options={{
            headerShown: false,
        }}
      />
      <AuthenticationStack.Screen
        name="ForgotPasswordSubmitScreen"
        component={ForgotPasswordSubmitScreen}
        options={{
            headerShown: false,
        }}
      />
      <AuthenticationStack.Screen
        name="ForgotPasswordAffirmScreen"
        component={ForgotPasswordAffirmScreen}
        options={{
            headerShown: false,
        }}
      />
      <AuthenticationStack.Screen
        name="ConfirmEmailScreen"
        component={ConfirmEmailScreen}
        options={{headerShown: false,
        }}
      />
    </AuthenticationStack.Navigator>
  );
}