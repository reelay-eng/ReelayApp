/**
 * Learn more about createBottomTabNavigator:
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { Fragment, useState, useRef } from 'react';
import styled from 'styled-components/native';
import { useSelector } from "react-redux";

import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, SafeAreaView, View } from 'react-native';

import { 
	HomeTabNavigator, 
	FeedTabNavigator, 
	CreateReelayTabNavigator, 
	ProfileTabNavigator, 
	ClubsTabNavigator,
	DecisionTabNavigator
} from './BottomTabs';

import { CameraPlusIconSVG, ChatsTabIconSVG } from '../components/global/SVGs';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCircleUser,faTelevision, faCompass, faHouse, faUsers, faVideo,faUserCheck } from '@fortawesome/free-solid-svg-icons';
import CreateTabDrawer from '../screens/authenticated/CreateTabDrawer';
 
const BottomTab = createBottomTabNavigator();
const TAB_BAR_ACTIVE_OPACITY = 1;
const TAB_BAR_INACTIVE_OPACITY = 0.8;

const IconFocusView = styled(View)`
	align-items: center;
	border-radius: 24px;
	background-color: transparent;
	justify-content: center;
	opacity: 1;
`
const IconFocusIndicator = styled(View)`
	top: 48px;
	border-radius: 4px;
	background-color: rgba(255,255,255,1);
	height: 4px;
	position: absolute;
	width: 4px;
`
const UnreadIconIndicator = styled(SafeAreaView)`
	background-color: ${ReelayColors.reelayBlue}
	border-radius: 5px;
	height: 10px;
	width: 10px;
	position: absolute;
	right: 0px;
`

export default AuthenticatedNavigator = () => {
	const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
	const navigationRef = useRef(null);
	const hasUnseenReelays = useSelector(state => state.discoverHasUnseenReelays);
	const tabBarVisible = useSelector((state) => state.tabBarVisible);
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
					justifyContent: 'flex-end',
					position: "absolute",
					borderTopWidth: 0,
					display: tabBarVisible ? "flex" : "none",
					elevation: 0,
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
				lazy: false,
			}}
		>
			{/* <BottomTab.Screen
				name="Home"
				component={HomeTabNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						<IconFocusView focused={focused}>
							<FontAwesomeIcon icon={faHouse} color={focused ? 'white' : '#D4D4D4'} size={24} />
							{ focused && <IconFocusIndicator /> }
						</IconFocusView>
					),
				}}
			/> */}
			<BottomTab.Screen
				name="Discover"
				component={HomeTabNavigator}//FeedTabNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						<View>
							<IconFocusView focused={focused}>
								<FontAwesomeIcon icon={faCompass} size={24} color={focused ? 'white' : '#D4D4D4'} />
								{ focused && <IconFocusIndicator /> }
							</IconFocusView>
							{ hasUnseenReelays && <UnreadIconIndicator /> }
						</View>
					),
				}}
			/>
			<BottomTab.Screen
				name="Create"
				// component={CreateReelayTabNavigator}
				component={CreateReelayTabNavigator}
				// listeners={({ navigation }) => ({
				// 	tabPress: (event) => {
				// 		event.preventDefault();
				// 		navigationRef.current = navigation;
				// 		setCreateDrawerOpen(true);
				// 	}
				// })}
				options={{
					tabBarIcon: ({ focused }) => (
						<Fragment>
							{/* { createDrawerOpen && (
								<CreateTabDrawer navigation={navigationRef?.current} closeDrawer={() => setCreateDrawerOpen(false)} />
							)} */}
							<IconFocusView focused={focused}>
								<CameraPlusIconSVG />
								{/* <FontAwesomeIcon icon={faVideo} size={28} color={focused ? 'white' : '#D4D4D4'} /> */}
								{ focused && <IconFocusIndicator /> }
							</IconFocusView>
						</Fragment>
					),
				}}
			/>
			{/* <BottomTab.Screen
				// name="Chats"
				name="Decide"
				component={DecisionTabNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						<IconFocusView focused={focused}>
							<FontAwesomeIcon icon={faUserCheck} color={focused ? 'white' : '#D4D4D4'} size={30} />
							{ focused && <IconFocusIndicator /> }
						</IconFocusView>
					),
				}}
			/> */}
			{/* <BottomTab.Screen
				name="Profile"
				component={ProfileTabNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						<IconFocusView focused={focused}>
							<FontAwesomeIcon icon={faCircleUser} color={focused ? 'white' : '#D4D4D4'} size={24} />
							{ focused && <IconFocusIndicator /> }
						</IconFocusView>
					),
				}}
			/> */}
			<BottomTab.Screen
				name="Watch"
				component={ProfileTabNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						<IconFocusView focused={focused}>
							<FontAwesomeIcon icon={faTelevision} color={focused ? 'white' : '#D4D4D4'} size={24} />
							{ focused && <IconFocusIndicator /> }
						</IconFocusView>
					),
				}}
			/>
		</BottomTab.Navigator>
	);
}
