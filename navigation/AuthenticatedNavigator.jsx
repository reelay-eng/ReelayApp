/**
 * Learn more about createBottomTabNavigator:
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext } from 'react';
import styled from 'styled-components/native';

import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, SafeAreaView, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { FeedContext } from '../context/FeedContext';

import HomeFeedScreen from '../screens/authenticated/HomeFeedScreen';
import MyProfileScreen from '../screens/authenticated/MyProfileScreen';
import NotificationScreen from '../screens/authenticated/NotificationScreen';
import NotificationSettingsScreen from '../screens/authenticated/NotificationSettingsScreen';
import ProfileFeedScreen from '../screens/authenticated/ProfileFeedScreen';
import ProfileSettingsScreen from '../screens/authenticated/ProfileSettingsScreen';
import ReelayCameraScreen from '../screens/authenticated/ReelayCameraScreen';
import ReelayUploadScreen from '../screens/authenticated/ReelayUploadScreen';
import ReportedContentFeedScreen from '../screens/authenticated/ReportedContentFeedScreen';
import SearchScreen from '../screens/authenticated/SearchScreen';
import SelectTitleScreen from '../screens/authenticated/SelectTitleScreen';
import SendRecScreen from '../screens/authenticated/SendRecScreen';
import SingleReelayScreen from '../screens/authenticated/SingleReelayScreen';
import TitleDetailScreen from '../screens/authenticated/TitleDetailScreen';
import TitleFeedScreen from '../screens/authenticated/TitleFeedScreen';
import TitleTrailerScreen from '../screens/authenticated/TitleTrailerScreen';
import TMDBCreditScreen from '../screens/authenticated/TMDBCreditScreen';
import UserFollowScreen from '../screens/authenticated/UserFollowScreen';
import UserProfileScreen from '../screens/authenticated/UserProfileScreen';
import VenueSelectScreen from '../screens/authenticated/VenueSelectScreen';
import WatchlistScreen from '../screens/authenticated/WatchlistScreen';

import HomeIcon from '../assets/icons/navbar/home-icon.png';
import ProfileIcon from '../assets/icons/navbar/profile-icon.png';
import SearchIcon from '../assets/icons/navbar/search-icon.png';
import CreateIcon from '../assets/icons/navbar/create-icon.png';
import WatchlistIcon from '../assets/icons/navbar/watchlist-icon.png';
 
const AppStack = createStackNavigator();
const BottomTab = createBottomTabNavigator();
const HomeTabStack = createStackNavigator();
const SearchTabStack = createStackNavigator();
const CreateReelayTabStack = createStackNavigator();
const WatchlistTabStack = createStackNavigator();
const ProfileTabStack = createStackNavigator();

const BOTTOM_TAB_ICON_SIZE = 24;
const TAB_BAR_ACTIVE_OPACITY = 1;
const TAB_BAR_INACTIVE_OPACITY = 0.8;

const UnreadIconIndicator = styled(SafeAreaView)`
	background-color: ${ReelayColors.reelayBlue}
	border-radius: 5px;
	height: 10px;
	width: 10px;
	position: absolute;
	right: 0px;
`

export default AuthenticatedNavigator = () => {
    return (
        <AppStack.Navigator initialRouteName='BottomTab'>
            <AppStack.Screen name='BottomTab' component={BottomTabNavigator} 
                options={{ headerShown: false }} />
            <AppStack.Screen name='VenueSelectScreen' component={VenueSelectScreen}
                options={{ headerShown: false }} />
            <AppStack.Screen name='ReelayCameraScreen' component={ReelayCameraScreen}
                options={{ headerShown: false }} />
            <AppStack.Screen name='ReelayUploadScreen' component={ReelayUploadScreen}
                options={{ headerShown: false }} /> 
        </AppStack.Navigator>
    );
}

const bottomTabIconStyle = (focused) => {
	return {
		opacity: (focused)
			? TAB_BAR_ACTIVE_OPACITY
			: TAB_BAR_INACTIVE_OPACITY,
		width: BOTTOM_TAB_ICON_SIZE,
		height: BOTTOM_TAB_ICON_SIZE,
	};
};

const BottomTabNavigator = () => {
	const { myNotifications } = useContext(AuthContext);
	const hasUnreadNotifications = myNotifications.filter(({ seen }) => !seen).length > 0;

    const { tabBarVisible } = useContext(FeedContext);
    const s = StyleSheet.create({
		gradient: {
			flex: 1,
			height: "100%",
			width: "100%",
			borderWidth: 0,
		},
	});
    return (
		<BottomTab.Navigator
			initialRouteName="Home"
			screenOptions={{
				tabBarActiveTintColor: `#rgba(255, 255, 255, ${TAB_BAR_ACTIVE_OPACITY})`,
				tabBarInactiveTintColor: `#rgba(255, 255, 255, ${TAB_BAR_INACTIVE_OPACITY})`,
				tabBarShowLabel: true,
				tabBarLabelStyle: {
					fontFamily: "Outfit-Medium",
					fontSize: 12,
					fontStyle: "normal",
					lineHeight: 16,
					letterSpacing: 0.4,
					textAlign: "left",
					marginTop: -3,
				},
				headerShown: false,
				tabBarStyle: {
					position: "absolute",
					borderTopWidth: 0,
					paddingTop: 20,
					height: 100,
					elevation: 0,
					display: tabBarVisible ? "flex" : "none",
					paddingLeft: 10,
					paddingRight: 10,
				},
				tabBarBackground: () => (
					<LinearGradient
						colors={["transparent", ReelayColors.reelayBlack]}
						locations={[0.25, 1]}
						style={[StyleSheet.absoluteFill, s.gradient]}
					/>
				),
			}}
		>
			<BottomTab.Screen
				name="Home"
				component={HomeTabNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						<Image
							source={HomeIcon}
							style={bottomTabIconStyle(focused)}
						/>
					),
				}}
			/>
			<BottomTab.Screen
				name="Search"
				component={SearchTabNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						<Image
							source={SearchIcon}
							style={bottomTabIconStyle(focused)}
						/>
					),
				}}
			/>
			<BottomTab.Screen
				name="Create"
				component={CreateReelayTabNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						<Image
							source={CreateIcon}
							style={bottomTabIconStyle(focused)}
						/>
					),
				}}
			/>
			<BottomTab.Screen
				name="Watchlist"
				component={WatchlistTabNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						<Image
							source={WatchlistIcon}
							style={bottomTabIconStyle(focused)}
						/>
					),
				}}
			/>
			<BottomTab.Screen
				name="Profile"
				component={ProfileTabNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						<View>
							<Image
								source={ProfileIcon}
								style={bottomTabIconStyle(focused)}
							/>
							{ hasUnreadNotifications && <UnreadIconIndicator /> }
						</View>
					),
				}}
			/>
		</BottomTab.Navigator>
	);
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab

const HomeTabNavigator = () => {
    return (
        <HomeTabStack.Navigator>
            <HomeTabStack.Screen
                name='HomeFeedScreen'
                component={HomeFeedScreen}
                options={{
                    headerShown: false,
                }}
            />
            <HomeTabStack.Screen
                name='UserFollowScreen'
                component={UserFollowScreen}
                options={{
                    headerShown: false,
                }}
            />
            <HomeTabStack.Screen
                name='UserProfileScreen'
                component={UserProfileScreen}
                options={{
                    headerShown: false,
                }}
            />
            <HomeTabStack.Screen
                name='ProfileFeedScreen'
                component={ProfileFeedScreen}
                options={{
                    headerShown: false,
                }}
            />
			<HomeTabStack.Screen
				name='SingleReelayScreen'
				component={SingleReelayScreen}
				options={{
					headerShown: false,
				}}	
			/>
            <HomeTabStack.Screen
                name='ReportedContentFeedScreen'
                component={ReportedContentFeedScreen}
                options={{
                    headerShown: false,
                }}
            />
			<HomeTabStack.Screen 
				name='SendRecScreen'
				component={SendRecScreen}
				options={{
					headerShown: false,
				}}
			/>
            <HomeTabStack.Screen
                name='TitleDetailScreen'
                component={TitleDetailScreen}
                options={{
                    headerShown: false,
                }}
            />
            <HomeTabStack.Screen
                name='TitleFeedScreen'
                component={TitleFeedScreen}
                options={{
                    headerShown: false,
                }}
            />
            <HomeTabStack.Screen
                name='TitleTrailerScreen'
                component={TitleTrailerScreen}
                options={{
                    headerShown: false,
                }}
            />
        </HomeTabStack.Navigator>
    );
}
// Can you make the route names into constants so that it's easier to use everywhere?

const SearchTabNavigator = () => {
    return (
        <SearchTabStack.Navigator
            initialRouteName='SearchScreen'
            detachInactiveScreens={false}
        >
            <SearchTabStack.Screen
                name='SearchScreen'
                component={SearchScreen}
                options={{
                    headerShown: false,
                    animationEnabled: false,
                }}
            />
            <SearchTabStack.Screen
                name='UserProfileScreen'
                component={UserProfileScreen}
                options={{
                    headerShown: false,
                }}
            />
            <SearchTabStack.Screen
                name='UserFollowScreen'
                component={UserFollowScreen}
                options={{
                    headerShown: false,
                }}
            />
            <SearchTabStack.Screen
                name='ProfileFeedScreen'
                component={ProfileFeedScreen}
                options={{
                    headerShown: false,
                }}
            />
			<SearchTabStack.Screen
                name='ReportedContentFeedScreen'
                component={ReportedContentFeedScreen}
                options={{
                    headerShown: false,
                }}
            />
			<SearchTabStack.Screen 
				name='SendRecScreen'
				component={SendRecScreen}
				options={{
					headerShown: false,
				}}
			/>
            <SearchTabStack.Screen
                name='SingleReelayScreen'
                component={SingleReelayScreen}
                options={{
                    headerShown: false,
                }}
            />
            <SearchTabStack.Screen
                name='TitleDetailScreen'
                component={TitleDetailScreen}
                options={{
                    headerShown: false,
                }}
            />
            <SearchTabStack.Screen
                name='TitleFeedScreen'
                component={TitleFeedScreen}
                options={{
                    headerShown: false,
                }}
            />
            <SearchTabStack.Screen
                name='TitleTrailerScreen'
                component={TitleTrailerScreen}
                options={{
                    headerShown: false,
                }}
            />
        </SearchTabStack.Navigator>
    );
}

// Can you make the route names into constants so that it's easier to use everywhere?

const CreateReelayTabNavigator = () => {
    return (
        <CreateReelayTabStack.Navigator
            initialRouteName='SelectTitleScreen'
            detachInactiveScreens={false}
        >
            <CreateReelayTabStack.Screen
                name='SelectTitleScreen'
                component={SelectTitleScreen}
                options={{
                    headerShown: false,
                    animationEnabled: false,
                }}
            />
        </CreateReelayTabStack.Navigator>
    );
}

const WatchlistTabNavigator = () => {
	return (
        <WatchlistTabStack.Navigator
            initialRouteName='WatchlistScreen'
            detachInactiveScreens={false}
        >
            <WatchlistTabStack.Screen
                name='WatchlistScreen'
                component={WatchlistScreen}
                options={{
                    headerShown: false,
                    animationEnabled: false,
                }}
            />
			<WatchlistTabStack.Screen
                name='UserProfileScreen'
                component={UserProfileScreen}
                options={{
                    headerShown: false,
                }}
            />
            <WatchlistTabStack.Screen
                name='UserFollowScreen'
                component={UserFollowScreen}
                options={{
                    headerShown: false,
                }}
            />
            <WatchlistTabStack.Screen
                name='ProfileFeedScreen'
                component={ProfileFeedScreen}
                options={{
                    headerShown: false,
                }}
            />
			<WatchlistTabStack.Screen 
				name='SendRecScreen'
				component={SendRecScreen}
				options={{
					headerShown: false,
				}}
			/>
            <WatchlistTabStack.Screen
                name='SingleReelayScreen'
                component={SingleReelayScreen}
                options={{
                    headerShown: false,
                }}
            />
			<WatchlistTabStack.Screen
                name='ReportedContentFeedScreen'
                component={ReportedContentFeedScreen}
                options={{
                    headerShown: false,
                }}
            />
            <WatchlistTabStack.Screen
                name='TitleDetailScreen'
                component={TitleDetailScreen}
                options={{
                    headerShown: false,
                }}
            />
            <WatchlistTabStack.Screen
                name='TitleFeedScreen'
                component={TitleFeedScreen}
                options={{
                    headerShown: false,
                }}
            />
            <WatchlistTabStack.Screen
                name='TitleTrailerScreen'
                component={TitleTrailerScreen}
                options={{
                    headerShown: false,
                }}
            />
        </WatchlistTabStack.Navigator>
    );
}

const ProfileTabNavigator = () => {
    return (
		<ProfileTabStack.Navigator initialRouteName="MyProfileScreen" detachInactiveScreens={false}>
			<ProfileTabStack.Screen
				name="MyProfileScreen"
				component={MyProfileScreen}
				options={{
					headerShown: false,
				}}
			/>
			<ProfileTabStack.Screen
				name="UserProfileScreen"
				component={UserProfileScreen}
				options={{
					headerShown: false,
				}}
			/>
			<ProfileTabStack.Screen
				name="UserFollowScreen"
				component={UserFollowScreen}
				options={{
					headerShown: false,
				}}
			/>
			<ProfileTabStack.Screen
				name="ProfileFeedScreen"
				component={ProfileFeedScreen}
				options={{
					headerShown: false,
				}}
			/>
			<ProfileTabStack.Screen
				name="ReportedContentFeedScreen"
				component={ReportedContentFeedScreen}
				options={{
					headerShown: false,
				}}
			/>
			<ProfileTabStack.Screen 
				name='SendRecScreen'
				component={SendRecScreen}
				options={{
					headerShown: false,
				}}
			/>
			<ProfileTabStack.Screen
				name="SingleReelayScreen"
				component={SingleReelayScreen}
				options={{
					headerShown: false,
				}}
			/>
			<ProfileTabStack.Screen
				name="TitleDetailScreen"
				component={TitleDetailScreen}
				options={{
					headerShown: false,
				}}
			/>
			<ProfileTabStack.Screen
				name="TitleFeedScreen"
				component={TitleFeedScreen}
				options={{
					headerShown: false,
				}}
			/>
			<ProfileTabStack.Screen
				name="TitleTrailerScreen"
				component={TitleTrailerScreen}
				options={{
					headerShown: false,
				}}
			/>

			{/* Settings */}
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
				name="NotificationScreen"
				component={NotificationScreen}
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
		</ProfileTabStack.Navigator>
	);
}
