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
import { StyleSheet, SafeAreaView, View } from 'react-native';

import { 
	HomeTabNavigator, 
	FeedTabNavigator, 
	CreateReelayTabNavigator, 
	ProfileTabNavigator, 
	ClubsTabNavigator
} from './BottomTabs';

import { ClubsIconSVG } from '../components/global/SVGs';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCirclePlus, faCircleUser, faEarthAmericas, faHouse } from '@fortawesome/free-solid-svg-icons';
 
const BottomTab = createBottomTabNavigator();
const TAB_BAR_ACTIVE_OPACITY = 1;
const TAB_BAR_INACTIVE_OPACITY = 0.8;

const IconFocusView = styled(View)`
	align-items: center;
	border-radius: 24px;
	background-color: ${props => props.focused ? 'black' : 'transparent'};
	justify-content: center;
	opacity: ${props => props.focused ? 1 : 0.8};
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
	const hasUnseenGlobalReelays = useSelector(state => state.hasUnseenGlobalReelays);
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
						<IconFocusView focused={focused}>
							<FontAwesomeIcon icon={faHouse} color='white' size={24} />
							{ focused && <IconFocusIndicator /> }
						</IconFocusView>
					),
				}}
			/>
			<BottomTab.Screen
				name="Clubs"
				component={ClubsTabNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						<IconFocusView focused={focused}>
							<ClubsIconSVG />
							{ focused && <IconFocusIndicator /> }
						</IconFocusView>
					),
				}}
			/>
			<BottomTab.Screen
				name="Create"
				component={CreateReelayTabNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						<IconFocusView focused={focused}>
							<FontAwesomeIcon icon={faCirclePlus} size={27} color='white' />
							{ focused && <IconFocusIndicator /> }
						</IconFocusView>
					),
				}}
			/>
			<BottomTab.Screen
				name="Global"
				component={FeedTabNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						<View>
							<IconFocusView focused={focused}>
								<FontAwesomeIcon icon={faEarthAmericas} size={24} color='white' />
								{ focused && <IconFocusIndicator /> }
							</IconFocusView>
							{hasUnseenGlobalReelays && <UnreadIconIndicator /> }
						</View>
					),
				}}
			/>
			<BottomTab.Screen
				name="Profile"
				component={ProfileTabNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						<IconFocusView focused={focused}>
							<FontAwesomeIcon icon={faCircleUser} color='white' size={24} />
							{ focused && <IconFocusIndicator /> }
						</IconFocusView>
					),
				}}
			/>
		</BottomTab.Navigator>
	);
}
