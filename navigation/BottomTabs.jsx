import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthenticatedCommonStack from './AuthenticatedCommonStack';

import AccountInfoScreen from '../screens/authenticated/AccountInfoScreen';
import AdminReportedIssuesScreen from '../screens/authenticated/AdminReportedIssuesScreen';
import CreateScreen from '../screens/authenticated/CreateScreen';
import DeleteAccountScreen from '../screens/authenticated/DeleteAccountScreen';
import EditAccountScreen from '../screens/authenticated/EditAccountScreen';
import HomeScreen from '../screens/authenticated/HomeScreen';
import HouseRulesScreen from '../screens/authenticated/HouseRulesScreen';
import MyClubsScreen from '../screens/authenticated/MyClubsScreen';
import MyProfileScreen from '../screens/authenticated/MyProfileScreen';
import NotificationSettingsScreen from '../screens/authenticated/NotificationSettingsScreen';
import ProfileSettingsScreen from '../screens/authenticated/ProfileSettingsScreen';
import TMDBCreditScreen from '../screens/authenticated/TMDBCreditScreen';
import MyWatchlistScreen from '../screens/authenticated/WatchlistScreen';
import CreateTopicScreen from '../screens/authenticated/CreateTopicScreen';
import SearchTitleScreen from '../screens/unauthenticated/SearchScreen';
import SelectMovieScreen from '../screens/unauthenticated/SelectMovieScreen';
import { useSelector } from 'react-redux';

export const HomeTabNavigator = ({ navigation, route }) => {
    const HomeTabStack = createStackNavigator();
    const commonOptions = { headerShown: false };
    const openAddTitle = useSelector(state => state.openAddTitle);

	return (
		<AuthenticatedCommonStack initialRouteName= {openAddTitle ? "SearchTitleScreen":"HomeScreen"}>
            {/* //"HomeScreen"> */}
			<HomeTabStack.Screen name='HomeScreen' component={HomeScreen} options={commonOptions} />
            {/* <HomeTabStack.Screen name="SearchTitleScreen" component={SearchTitleScreen} options={commonOptions} />
            <HomeTabStack.Screen name="SelectMovieScreen" component={SelectMovieScreen} options={commonOptions} /> */}
		</AuthenticatedCommonStack>
	)
}

export const FeedTabNavigator = () => {
    return <AuthenticatedCommonStack initialRouteName={'FeedScreen'} />;
}

export const CreateReelayTabNavigator = () => {
    const CreateTabStack = createStackNavigator();
    const commonOptions = { headerShown: false };
    return (
        <AuthenticatedCommonStack initialRouteName='SelectTitleScreen'>
            {/* <CreateTabStack.Screen name="CreateScreen" component={CreateScreen} options={commonOptions} /> */}
            {/* <CreateTabStack.Screen name="CreateTopicScreen" component={CreateTopicScreen} options={commonOptions} /> */}
        </AuthenticatedCommonStack>
    );
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

export const DecisionTabNavigator = () => {
    const DecisionTabStack = createStackNavigator();
    const commonOptions = { headerShown: false };
	return (
        <AuthenticatedCommonStack initialRouteName='MyWatchlistScreen'>
            <DecisionTabStack.Screen name='MyWatchlistScreen' component={MyWatchlistScreen} options={{ 
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
            <ProfileTabStack.Screen name="HouseRulesScreen" component={HouseRulesScreen} options={commonOptions} />
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
