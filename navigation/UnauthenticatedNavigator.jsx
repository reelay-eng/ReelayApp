import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import ChooseUsernameScreen from '../screens/unauthenticated/ChooseUsernameScreen';
import ConfirmEmailScreen from '../screens/unauthenticated/ConfirmEmailScreen';
import ForgotPasswordScreen from '../screens/unauthenticated/ForgotPasswordScreen';
import ForgotPasswordSubmitScreen from '../screens/unauthenticated/ForgotPasswordSubmitScreen';
import OnboardHouseRulesScreen from '../screens/unauthenticated/OnboardHouseRulesScreen';
import SelectMyStreamingScreen from '../screens/unauthenticated/SelectMyStreamingScreen';
import SignedOutScreen from '../screens/unauthenticated/SignedOutScreen';
import SignInScreen from '../screens/unauthenticated/SignInScreen';
import SignUpScreen from '../screens/unauthenticated/SignUpScreen';
import SplashScreen from '../screens/unauthenticated/SplashScreen';
import ChooseUsernameScreenEmail from '../screens/unauthenticated/ChooseUsernameScreenold';
import SelectMovieScreen from '../screens/unauthenticated/SelectMovieScreen';
import SearchTitleScreen from '../screens/unauthenticated/SearchScreen';
// import TutorialScreen from '../screens/unauthenticated/TutorialScreen';
import { useSelector } from 'react-redux';
import LandingScreen from '../screens/unauthenticated/LandingScreen';
import { async } from 'validate.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthenticationStack = createStackNavigator();

export default UnauthenticatedNavigator = ({route}) => {
    const isReturningUser = useSelector(state => state.isReturningUser)
    const { redirect } = route?.params
    const initialRoute = redirect??'SignedOutScreen';
    // let initialRoute = 'SelectMovieScreen';

    return (
        <AuthenticationStack.Navigator
            initialRouteName={initialRoute}
            detachInactiveScreens={false}
        >
            <AuthenticationStack.Screen
                name="ChooseUsernameScreen"
                component={ChooseUsernameScreen}
                options={{
                    headerShown: false,
                }}
            />
            <AuthenticationStack.Screen
                name="LandingScreen"
                component={LandingScreen}
                options={{
                    headerShown: false,
                }}
            />
            <AuthenticationStack.Screen
                name="ChooseUsernameScreenEmail"
                component={ChooseUsernameScreenEmail}
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
            <AuthenticationStack.Screen
                name="SearchTitleScreen"
                component={SearchTitleScreen}
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
                name="SelectMovieScreen"
                component={SelectMovieScreen}
                options={{
                    headerShown: false,
                }}
            />
            <AuthenticationStack.Screen
                name="OnboardHouseRulesScreen"
                component={OnboardHouseRulesScreen}
                options={{
                    headerShown: false,
                }}
            />
            <AuthenticationStack.Screen
                name="SelectMyStreamingScreen"
                component={SelectMyStreamingScreen}
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
            {/* <AuthenticationStack.Screen
                name="TutorialScreen"
                component={TutorialScreen}
                options={{
                    headerShown: false,
                }}
            /> */}
        </AuthenticationStack.Navigator>
    );
}