/**
 * If you are not familiar with React Navigation, check out the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import React, { useContext, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ColorSchemeName } from 'react-native';

import { AuthContext } from '../context/AuthContext';
import NotFoundScreen from '../screens/unauthenticated/NotFoundScreen';

import AuthenticatedNavigator from './AuthenticatedNavigator';
import UnauthenticatedNavigator from './UnauthenticatedNavigator';
import LinkingConfiguration from './LinkingConfiguration';
import { RootStackParamList } from '../types';

// theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
    return (
        <NavigationContainer
            linking={LinkingConfiguration}
            theme={DarkTheme}>
            <RootNavigator />
        </NavigationContainer>
    );
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator<RootStackParamList>();

function RootNavigator() {
    const { signedIn } = useContext(AuthContext);

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            { signedIn && <Stack.Screen name="Authenticated" component={AuthenticatedNavigator} /> }
            { !signedIn && <Stack.Screen name="Unauthenticated" component={UnauthenticatedNavigator} /> }
            <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
        </Stack.Navigator>
    );
}