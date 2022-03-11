import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthContext } from "../context/AuthContext";

import ChooseUsernameScreen from '../screens/unauthenticated/ChooseUsernameScreen';
import ConfirmEmailScreen from '../screens/unauthenticated/ConfirmEmailScreen';
import ForgotPasswordScreen from '../screens/unauthenticated/ForgotPasswordScreen';
import ForgotPasswordSubmitScreen from '../screens/unauthenticated/ForgotPasswordSubmitScreen';
import NewUserScreen from '../screens/unauthenticated/NewUserScreen';
import SignedOutScreen from '../screens/unauthenticated/SignedOutScreen';
import SignInScreen from '../screens/unauthenticated/SignInScreen';
import SignUpScreen from '../screens/unauthenticated/SignUpScreen';
import SplashScreen from '../screens/unauthenticated/SplashScreen';

const AuthenticationStack = createStackNavigator();

export default UnauthenticatedNavigator = () => {
    const { isReturningUser } = React.useContext(AuthContext);
  return (
    <AuthenticationStack.Navigator
        initialRouteName={isReturningUser?"SignedOutScreen":"NewUserScreen"}
        detachInactiveScreens={false}
      >
        <AuthenticationStack.Screen
            name="NewUserScreen"
            component={NewUserScreen}
            options={{
                headerShown: false,
            }}
        />
        <AuthenticationStack.Screen
            name="SignedOutScreen"
            component={SignedOutScreen}
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
            name="ChooseUsernameScreen"
            component={ChooseUsernameScreen}
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
            name="SplashScreen"
            component={SplashScreen}
            options={{
                animationEnabled: false,
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
            name="ConfirmEmailScreen"
            component={ConfirmEmailScreen}
            options={{
                headerShown: false,
            }}
        />
    </AuthenticationStack.Navigator>
  );
}