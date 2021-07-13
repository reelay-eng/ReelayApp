/**
 * Learn more about createBottomTabNavigator:
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons'; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import HomeFeedScreen from '../screens/HomeFeedScreen';
import { BottomTabParamList, HomeTabParamList, CreateReelayTabParamList } from '../types';

import SelectTitleScreen from '../screens/SelectTitleScreen';
import ReelayCameraScreen from '../screens/ReelayCameraScreen';
import ReelayPreviewScreen from '../screens/ReelayPreviewScreen';
import UploadReelayButton2 from '../components/create-reelay/UploadReelayButton2';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Home"
      tabBarOptions={{ 
        activeTintColor: Colors[colorScheme].tint,
        style: { backgroundColor: 'black'}
      }}
    >
      <BottomTab.Screen
        name="Home"
        component={HomeTabNavigator}
        options={{
          tabBarIcon: ({ color }) => <AntDesign name="find" size={24} color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Create" 
        component={CreateReelayTabNavigator} 
        options={{
          tabBarIcon: ({ color }) => <AntDesign name="videocamera" size={24} color={color} />
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons size={30} style={{ marginBottom: -3 }} {...props} />;
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
        }}
      />
      <CreateReelayTabStack.Screen
        name="ReelayCameraScreen"
        component={ReelayCameraScreen}
        options={{ 
          title: '',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: 'black' }
        }}
      />
      <CreateReelayTabStack.Screen
        name="ReelayPreviewScreen"
        component={ReelayPreviewScreen}
        options={({navigation, route}) => ({
          title: 'Preview Reelay',
          headerRight: props => (<UploadReelayButton2 navigation={navigation} />),
        })}
      />
    </CreateReelayTabStack.Navigator>
  );
}