import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthenticatedCommonStack from './AuthenticatedCommonStack';

import AccountInfoScreen from '../screens/authenticated/AccountInfoScreen';
import AdminReportedIssuesScreen from '../screens/authenticated/AdminReportedIssuesScreen';
import DeleteAccountScreen from '../screens/authenticated/DeleteAccountScreen';
import EditAccountScreen from '../screens/authenticated/EditAccountScreen';
import HomeScreen from '../screens/authenticated/HomeScreen';
import MyClubsScreen from '../screens/authenticated/MyClubsScreen';
import MyProfileScreen from '../screens/authenticated/MyProfileScreen';
import NotificationSettingsScreen from '../screens/authenticated/NotificationSettingsScreen';
import ProfileSettingsScreen from '../screens/authenticated/ProfileSettingsScreen';
import TMDBCreditScreen from '../screens/authenticated/TMDBCreditScreen';

export const HomeTabNavigator = () => {
    const HomeTabStack = createStackNavigator();
    const commonOptions = { headerShown: false };
	return (
		<AuthenticatedCommonStack initialRouteName="HomeScreen">
			<HomeTabStack.Screen name='HomeScreen' component={HomeScreen} options={commonOptions} />
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
			<ProfileTabStack.Screen name="NotificationSettingsScreen" component={NotificationSettingsScreen} options={commonOptions} />
			<ProfileTabStack.Screen name="AccountInfoScreen" component={AccountInfoScreen} options={commonOptions} />
			<ProfileTabStack.Screen name="DeleteAccountScreen" component={DeleteAccountScreen} options={commonOptions} />
			<ProfileTabStack.Screen name="EditAccountScreen" component={EditAccountScreen} options={commonOptions} />
            <ProfileTabStack.Screen name="AdminReportedIssuesScreen" component={AdminReportedIssuesScreen} options={commonOptions} />
		</AuthenticatedCommonStack>
	);
}
