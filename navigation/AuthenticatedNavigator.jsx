/**
 * Learn more about createBottomTabNavigator:
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useRef } from 'react';

import { Icon } from 'react-native-elements';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

import HomeFeedScreen from '../screens/authenticated/HomeFeedScreen';
import MyProfileScreen from '../screens/authenticated/MyProfileScreen';
import ProfileFeedScreen from '../screens/authenticated/ProfileFeedScreen';
import ProfileSettingsScreen from '../screens/authenticated/ProfileSettingsScreen';
import NotificationSettingsScreen from '../screens/authenticated/NotificationSettingsScreen';
import ReelayCameraScreen from '../screens/authenticated/ReelayCameraScreen';
import ReelayUploadScreen from '../screens/authenticated/ReelayUploadScreen';
import SearchScreen from '../screens/authenticated/SearchScreen';
import SelectTitleScreen from '../screens/authenticated/SelectTitleScreen';
import SingleReelayScreen from '../screens/authenticated/SingleReelayScreen';
import TitleDetailScreen from '../screens/authenticated/TitleDetailScreen';
import TitleFeedScreen from '../screens/authenticated/TitleFeedScreen';
import TitleTrailerScreen from '../screens/authenticated/TitleTrailerScreen';
import UserProfileScreen from '../screens/authenticated/UserProfileScreen';
import VenueSelectScreen from '../screens/authenticated/VenueSelectScreen';
 
const AppStack = createStackNavigator();
const BottomTab = createBottomTabNavigator();
const HomeTabStack = createStackNavigator();
const SearchTabStack = createStackNavigator();
const CreateReelayTabStack = createStackNavigator();
const ProfileTabStack = createStackNavigator();

const BOTTOM_TAB_ICON_SIZE = 40;

export default AuthenticatedNavigator = () => {
    return (
        <AppStack.Navigator initialRouteName='BottomTab'>
            <AppStack.Screen name='BottomTab' component={BottomTabNavigator} 
                options={{
                headerShown: false,
                }}
            />
            <AppStack.Screen name='VenueSelectScreen' component={VenueSelectScreen}
                options={{
                animationEnabled: false,
                headerShown: false,
                }} />
            <AppStack.Screen name='ReelayCameraScreen' component={ReelayCameraScreen}
                options={{ 
                animationEnabled: false,
                headerShown: false,
                }} />
            <AppStack.Screen name='ReelayUploadScreen' component={ReelayUploadScreen}
                options={{ 
                animationEnabled: false,
                headerShown: false,
                }} /> 
        </AppStack.Navigator>
    );
}

const BottomTabNavigator = () => {
    const colorScheme = useColorScheme();  

    return (
        <BottomTab.Navigator
            initialRouteName='Home'
            tabBarOptions={{
                activeTintColor: Colors[colorScheme].tint,
                showLabel: false,
                style: {
                    backgroundColor: 'transparent',
                    borderTopWidth: 0,
                    position: 'absolute',
                    left: 50,
                    right: 50,
                    height: 80,
                }
            }}
        >
        <BottomTab.Screen
            name='Home'
            component={HomeTabNavigator}
            options={{
                tabBarIcon: () => (
                    <Icon type='ionicon'
                        name='film-outline'
                        color={'white'}
                        size={BOTTOM_TAB_ICON_SIZE}
                    />
                ),
            }}
        />
        <BottomTab.Screen
            name='Search'
            component={SearchTabNavigator}
            options={{
                tabBarIcon: () => (
                    <Icon type='ionicon'
                        name='search'
                        color={'white'}
                        size={BOTTOM_TAB_ICON_SIZE}
                    />
                ),
            }}
        />
        <BottomTab.Screen
            name='Create'
            component={CreateReelayTabNavigator}
            options={{
                tabBarIcon: () => (
                    <Icon type='ionicon'
                        name='add-circle'
                        color={'white'}
                        size={BOTTOM_TAB_ICON_SIZE}
                    />
                ),
            }}
        />
        <BottomTab.Screen
            name='Profile'
            component={ProfileTabNavigator}
            options={{
                tabBarIcon: () => (
                    <Icon type='ionicon'
                        name='person-circle'
                        color={'white'}
                        size={BOTTOM_TAB_ICON_SIZE}
                    />
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
                name='ProfileFeedScreen'
                component={ProfileFeedScreen}
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
				name="ProfileFeedScreen"
				component={ProfileFeedScreen}
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
				name="NotificationSettingsScreen"
				component={NotificationSettingsScreen}
				options={{
					headerShown: false,
				}}
			/>
		</ProfileTabStack.Navigator>
	);
}
