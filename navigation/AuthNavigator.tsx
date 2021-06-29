import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthenticationStackParamList } from '../types';

import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

const AuthenticationStack = createStackNavigator<AuthenticationStackParamList>();

export default function AuthNavigator() {
  return (
    <AuthenticationStack.Navigator
      initialRouteName="SignUpScreen"
      detachInactiveScreens={false}
    >
      {/* <AuthenticationStack.Screen
        name="SplashScreen"
        component={SplashScreen}
      /> */}
      <AuthenticationStack.Screen
        name="SignUpScreen"
        component={SignUpScreen}
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
    </AuthenticationStack.Navigator>
  );
}