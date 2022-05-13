/**
 * Learn more about createBottomTabNavigator:
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext } from 'react';
import styled from 'styled-components/native';
import { useSelector } from "react-redux";

import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, SafeAreaView, View } from 'react-native';
import { Icon } from 'react-native-elements';

import { 
	HomeTabNavigator, 
	FeedTabNavigator, 
	CreateReelayTabNavigator, 
	ProfileTabNavigator, 
	ClubsTabNavigator
} from './BottomTabs';

import HomeIcon from '../assets/icons/navbar/home-icon.png';
import ProfileIcon from '../assets/icons/navbar/profile-icon.png';
import { ClubsIconSVG } from '../components/global/SVGs';
 
const BottomTab = createBottomTabNavigator();
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
const bottomTabIconStyle = (focused) => {
	return {
		opacity: (focused)
			? TAB_BAR_ACTIVE_OPACITY
			: TAB_BAR_INACTIVE_OPACITY,
		width: BOTTOM_TAB_ICON_SIZE,
		height: BOTTOM_TAB_ICON_SIZE,
	};
};

export default AuthenticatedNavigator = () => {
	const myNotifications = useSelector(state => state.myNotifications);
	const hasUnseenGlobalReelays = useSelector(state => state.hasUnseenGlobalReelays);
	const hasUnreadNotifications = myNotifications.filter(({ seen }) => !seen).length > 0;

	const tabBarVisible = useSelector((state) => state.tabBarVisible)
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
				lazy: false,
			}}
		>
			<BottomTab.Screen
				name="Home"
				component={HomeTabNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						<View>
							<Image
								source={HomeIcon}
								style={bottomTabIconStyle(focused)}
							/>
							{ hasUnreadNotifications && <UnreadIconIndicator /> }
						</View>
					),
				}}
			/>
			<BottomTab.Screen
				name="Global"
				component={FeedTabNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						<View>
							<Icon type='ionicon' name='earth' size={24} color='white' />
							{hasUnseenGlobalReelays && <UnreadIconIndicator /> }
						</View>
					),
				}}
			/>
			<BottomTab.Screen
				name="Create"
				component={CreateReelayTabNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						// note: this is intentionally oversized
						<Icon type='ionicon' name='add-circle' color='white' size={33} />
					),
				}}
			/>
			<BottomTab.Screen
				name="Clubs"
				component={ClubsTabNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						<Icon type='ionicon' name='people-circle' size={27} color='white' />
						// <ClubsIconSVG size={24} />
					),
				}}
			/>
			<BottomTab.Screen
				name="Profile"
				component={ProfileTabNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						<Image
							source={ProfileIcon}
							style={bottomTabIconStyle(focused)}
						/>
					),
				}}
			/>
		</BottomTab.Navigator>
	);
}
