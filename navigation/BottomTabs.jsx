import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthenticatedCommonStack from './AuthenticatedCommonStack';

import CreateClubScreen from '../screens/authenticated/CreateClubScreen';
import CreateTopicScreen from '../screens/authenticated/CreateTopicScreen';
import GeneralSettingsScreen from '../screens/authenticated/GeneralSettingsScreen';
import HomeScreen from '../screens/authenticated/HomeScreen';
import MyClubsScreen from '../screens/authenticated/MyClubsScreen';
import MyProfileScreen from '../screens/authenticated/MyProfileScreen';
import NotificationSettingsScreen from '../screens/authenticated/NotificationSettingsScreen';
import ProfileSettingsScreen from '../screens/authenticated/ProfileSettingsScreen';
import TopicsFeedScreen from '../screens/authenticated/TopicsFeedScreen';
import TopicsListScreen from '../screens/authenticated/TopicsListScreen';
import TMDBCreditScreen from '../screens/authenticated/TMDBCreditScreen';
import WatchlistScreen from '../screens/authenticated/WatchlistScreen';

export const HomeTabNavigator = () => {
    const HomeTabStack = createStackNavigator();
    const commonOptions = { headerShown: false };
	return (
		<AuthenticatedCommonStack initialRouteName="HomeScreen">
			<HomeTabStack.Screen name='HomeScreen' component={HomeScreen} options={commonOptions} />
			<HomeTabStack.Screen name='CreateTopicScreen' component={CreateTopicScreen} options={commonOptions} />
            <HomeTabStack.Screen name='TopicsFeedScreen' component={TopicsFeedScreen} options={commonOptions} />
			<HomeTabStack.Screen name='TopicsListScreen' component={TopicsListScreen} options={commonOptions} />
		</AuthenticatedCommonStack>
	)
}

export const FeedTabNavigator = () => {
    return <AuthenticatedCommonStack initialRouteName={'FeedScreen'} />;
}

export const CreateReelayTabNavigator = () => {
    return <AuthenticatedCommonStack initialRouteName='SelectTitleScreen' />;
}

export const ClubsTabNavigator = () => {
    const ClubsTabStack = createStackNavigator();
    const commonOptions = { headerShown: false };
	return (
        <AuthenticatedCommonStack initialRouteName='MyClubsScreen'>
            <ClubsTabStack.Screen name='MyClubsScreen' component={MyClubsScreen} options={{ 
                ...commonOptions,
                animationEnabled: false,
            }} />
            <ClubsTabStack.Screen name='CreateClubScreen' component={CreateClubScreen} options={commonOptions} />
            <ClubsTabStack.Screen name='WatchlistScreen' component={WatchlistScreen} options={commonOptions} />
        </AuthenticatedCommonStack>
    );
}

export const ProfileTabNavigator = () => {
    const ProfileTabStack = createStackNavigator();
    const commonOptions = { headerShown: false };
    return (
		<AuthenticatedCommonStack initialRouteName="MyProfileScreen">
			<ProfileTabStack.Screen name="MyProfileScreen" component={MyProfileScreen} options={commonOptions} />
			<ProfileTabStack.Screen name="ProfileSettingsScreen" component={ProfileSettingsScreen} options={commonOptions} />
			<ProfileTabStack.Screen name="TMDBCreditScreen" component={TMDBCreditScreen} options={commonOptions} />
			<ProfileTabStack.Screen name="GeneralSettingsScreen" component={GeneralSettingsScreen} options={commonOptions} />
			<ProfileTabStack.Screen name="NotificationSettingsScreen" component={NotificationSettingsScreen} options={commonOptions} />
		</AuthenticatedCommonStack>
	);
}
