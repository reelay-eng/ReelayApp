import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthenticatedCommonStack from './AuthenticatedCommonStack';

import CreateTopicScreen from '../screens/authenticated/CreateTopicScreen';
import GeneralSettingsScreen from '../screens/authenticated/GeneralSettingsScreen';
import HomeScreen from '../screens/authenticated/HomeScreen';
import MyProfileScreen from '../screens/authenticated/MyProfileScreen';
import NotificationSettingsScreen from '../screens/authenticated/NotificationSettingsScreen';
import ProfileSettingsScreen from '../screens/authenticated/ProfileSettingsScreen';
import TopicsFeedScreen from '../screens/authenticated/TopicsFeedScreen';
import TopicsListScreen from '../screens/authenticated/TopicsListScreen';
import TMDBCreditScreen from '../screens/authenticated/TMDBCreditScreen';
import WatchlistScreen from '../screens/authenticated/WatchlistScreen';

export const HomeTabNavigator = () => {
    const HomeTabStack = createStackNavigator();
	return (
		<AuthenticatedCommonStack initialRouteName="HomeScreen">
			<HomeTabStack.Screen
                name='HomeScreen'
                component={HomeScreen}
                options={{
                    headerShown: false,
                }}
            />
			<HomeTabStack.Screen
				name='CreateTopicScreen'
				component={CreateTopicScreen}
				options={{
					headerShown: false,
				}}
			/>
            <HomeTabStack.Screen
				name='TopicsFeedScreen'
				component={TopicsFeedScreen}
				options={{
					headerShown: false,
				}}
			/>
			<HomeTabStack.Screen
				name='TopicsListScreen'
				component={TopicsListScreen}
				options={{
					headerShown: false,
				}}
			/>
		</AuthenticatedCommonStack>
	)
}

export const FeedTabNavigator = () => {
    return <AuthenticatedCommonStack initialRouteName={'FeedScreen'} />;
}

export const CreateReelayTabNavigator = () => {
    const CreateReelayTabStack = createStackNavigator();
    return (
        <AuthenticatedCommonStack initialRouteName='SelectTitleScreen' />
    );
}

export const WatchlistTabNavigator = () => {
    const WatchlistTabStack = createStackNavigator();
	return (
        <AuthenticatedCommonStack initialRouteName='WatchlistScreen'>
            <WatchlistTabStack.Screen
                name='WatchlistScreen'
                component={WatchlistScreen}
                options={{
                    headerShown: false,
                    animationEnabled: false,
                }}
            />
        </AuthenticatedCommonStack>
    );
}

export const ProfileTabNavigator = () => {
    const ProfileTabStack = createStackNavigator();
    return (
		<AuthenticatedCommonStack initialRouteName="MyProfileScreen">
			<ProfileTabStack.Screen
				name="MyProfileScreen"
				component={MyProfileScreen}
				options={{
					headerShown: false,
				}}
			/>
			<ProfileTabStack.Screen
				name="ProfileSettingsScreen"
				component={ProfileSettingsScreen}
				options={{
					headerShown: false,
				}}
			/>
			<ProfileTabStack.Screen
				name="TMDBCreditScreen"
				component={TMDBCreditScreen}
				options={{
					headerShown: false,
				}}
			/>
			<ProfileTabStack.Screen
				name="GeneralSettingsScreen"
				component={GeneralSettingsScreen}
				options={{
					headerShown: false,
				}}
			/>
			<ProfileTabStack.Screen
				name="NotificationSettingsScreen"
				component={NotificationSettingsScreen}
				options={{
					headerShown: false,
				}}
			/>
		</AuthenticatedCommonStack>
	);
}
