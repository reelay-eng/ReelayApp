import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthenticationStackParamList } from '../types';

import ConfirmEmailScreen from '../screens/unauthenticated/ConfirmEmailScreen';
import ForgotPasswordScreen from '../screens/unauthenticated/ForgotPasswordScreen';
import ForgotPasswordSubmitScreen from '../screens/unauthenticated/ForgotPasswordSubmitScreen';
import ForgotPasswordAffirmScreen from '../screens/unauthenticated/ForgotPasswordAffirmScreen';
import SignInScreen from '../screens/unauthenticated/SignInScreen';
import SignUpScreen from '../screens/unauthenticated/SignUpScreen';
import SignUpEmailScreen from '../screens/unauthenticated/SignUpEmailScreen';
import SignUpUsernameScreen from '../screens/unauthenticated/SignUpUsernameScreen';

const AuthenticationStack = createStackNavigator<AuthenticationStackParamList>();

export default function UnauthenticatedNavigator() {
  return (
    <AuthenticationStack.Navigator
      initialRouteName="SignUpEmailScreen"
      detachInactiveScreens={false}
    >
      <AuthenticationStack.Screen
        name="SignUpEmailScreen"
        component={SignUpEmailScreen}
        options={{
            animationEnabled: false,
            headerShown: false,
        }}
      />
      <AuthenticationStack.Screen
        name="SignUpUsernameScreen"
        component={SignUpUsernameScreen}
        options={{
            headerShown: false,
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