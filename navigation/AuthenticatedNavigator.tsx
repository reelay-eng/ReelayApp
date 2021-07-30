/**
 * Learn more about createBottomTabNavigator:
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { VisibilityContext } from '../context/VisibilityContext';

import * as React from 'react';
import { Icon } from 'react-native-elements';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import HomeFeedScreen from '../screens/HomeFeedScreen';
import { BottomTabParamList, HomeTabParamList, CreateReelayTabParamList } from '../types';

import SelectTitleScreen from '../screens/SelectTitleScreen';
import ReelayCameraScreen from '../screens/ReelayCameraScreen';
import ReelayUploadScreen from '../screens/ReelayUploadScreen';
import UploadReelayButton from '../components/create-reelay/UploadReelayButton';
import AccountScreen from '../screens/AccountScreen';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function AuthenticatedNavigator() {
  const colorScheme = useColorScheme();

  const visibilityContext = React.useContext(VisibilityContext);


  return (
    <BottomTab.Navigator
      initialRouteName="Home"
      tabBarOptions={{ 
        activeTintColor: Colors[colorScheme].tint,
        showLabel: false,
        style: { 
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          position: 'absolute',
          left: 50,
          right: 50,
          height: 80      
        }
      }}
    >
      <BottomTab.Screen
        name="Home"
        component={HomeTabNavigator}
        options={{
          tabBarIcon: () => <Icon type='ionicon' name='film-outline' color={'white'} size={50} />,
        }}
      />
      <BottomTab.Screen
        name="Create" 
        component={CreateReelayTabNavigator} 
        options={{
          tabBarIcon: () => <Icon type='ionicon' name='add-circle-outline' color={'white'} size={50} />,
          tabBarVisible: false,
        }}
      />
    </BottomTab.Navigator>
  );
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const HomeTabStack = createStackNavigator<HomeTabParamList>();

function HomeTabNavigator() {
  return (
    <HomeTabStack.Navigator>
      <HomeTabStack.Screen
        name="HomeFeedScreen"
        component={HomeFeedScreen}
        options={{ 
          headerTitle: 'Find a Movie',
          headerShown: false
      }} />
      <HomeTabStack.Screen
        name="AccountScreen"
        component={AccountScreen}
        options={{
          headerShown: false
        }}
      />
    </HomeTabStack.Navigator>
  );
}

const CreateReelayTabStack = createStackNavigator<CreateReelayTabParamList>();

// Can you make the route names into constants so that it's easier to use everywhere?

function CreateReelayTabNavigator() {
  return (
    <CreateReelayTabStack.Navigator
      initialRouteName="SelectTitleScreen"
      detachInactiveScreens={false}
    >
      <CreateReelayTabStack.Screen
        name="SelectTitleScreen"
        component={SelectTitleScreen}
        options={{
          headerShown: false,
          animationEnabled: false,
        }}
      />
      <CreateReelayTabStack.Screen
        name="ReelayCameraScreen"
        component={ReelayCameraScreen}
        options={{ 
          headerShown: false,
          animationEnabled: false,
        }}
      />
      <CreateReelayTabStack.Screen
        name="ReelayUploadScreen"
        component={ReelayUploadScreen}
        options={{
          headerShown: false,
          animationEnabled: false,
        }}
      />
    </CreateReelayTabStack.Navigator>
  );
}