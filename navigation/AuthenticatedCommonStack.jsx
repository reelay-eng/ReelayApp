import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext } from 'react';

import FeedScreen from '../screens/authenticated/FeedScreen';
import NotificationScreen from '../screens/authenticated/NotificationScreen';
import ProfileFeedScreen from '../screens/authenticated/ProfileFeedScreen';
import ReportedContentFeedScreen from '../screens/authenticated/ReportedContentFeedScreen';
import SearchScreen from '../screens/authenticated/SearchScreen';
import SendRecScreen from '../screens/authenticated/SendRecScreen';
import SingleReelayScreen from '../screens/authenticated/SingleReelayScreen';
import TitleDetailScreen from '../screens/authenticated/TitleDetailScreen';
import TitleFeedScreen from '../screens/authenticated/TitleFeedScreen';
import TitleTrailerScreen from '../screens/authenticated/TitleTrailerScreen';
import UserFollowScreen from '../screens/authenticated/UserFollowScreen';
import UserProfileScreen from '../screens/authenticated/UserProfileScreen';

export default AuthenticatedCommonStack = ({ children, initialRouteName }) => {
    const CommonStack = createStackNavigator();

    return (
        <CommonStack.Navigator initialRouteName={initialRouteName} detachInactiveScreens={false}>
            { children }
            { /* ..... */}

            <CommonStack.Screen
                name='FeedScreen'
                component={FeedScreen}
                options={{
                    headerShown: false,
                }}
            />
            <CommonStack.Screen
				name="NotificationScreen"
				component={NotificationScreen}
				options={{
					headerShown: false,
				}}
			/>
            <CommonStack.Screen
                name='ProfileFeedScreen'
                component={ProfileFeedScreen}
                options={{
                    headerShown: false,
                }}
            />
			<CommonStack.Screen
                name='ReportedContentFeedScreen'
                component={ReportedContentFeedScreen}
                options={{
                    headerShown: false,
                }}
            />
            <CommonStack.Screen
                name='SearchScreen'
                component={SearchScreen}
                options={{
                    headerShown: false,
                }}
            />
			<CommonStack.Screen 
				name='SendRecScreen'
				component={SendRecScreen}
				options={{
					headerShown: false,
				}}
			/>
            <CommonStack.Screen
                name='SingleReelayScreen'
                component={SingleReelayScreen}
                options={{
                    headerShown: false,
                }}
            />
            <CommonStack.Screen
                name='TitleDetailScreen'
                component={TitleDetailScreen}
                options={{
                    headerShown: false,
                }}
            />
            <CommonStack.Screen
                name='TitleFeedScreen'
                component={TitleFeedScreen}
                options={{
                    headerShown: false,
                }}
            />
            <CommonStack.Screen
                name='TitleTrailerScreen'
                component={TitleTrailerScreen}
                options={{
                    headerShown: false,
                }}
            />
            <CommonStack.Screen
                name='UserProfileScreen'
                component={UserProfileScreen}
                options={{
                    headerShown: false,
                }}
            />
            <CommonStack.Screen
                name='UserFollowScreen'
                component={UserFollowScreen}
                options={{
                    headerShown: false,
                }}
            />
        </CommonStack.Navigator>
    );
}
