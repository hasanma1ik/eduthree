import { View, Text } from 'react-native'
import React from 'react'
import HomeScreen from '../screen/HomeScreen/HomeScreen';
import FavoriteScreen from '../screen/HomeScreen/FavoriteScreen/FavoriteScreen';
import ProfileScreen from '../screen/ProfileScreen/ProfileScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


const Tab = createBottomTabNavigator();

export default function TabNavigation() {
  return (
    
    <Tab.Navigator>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="favorite" component={FavoriteScreen} />
    <Tab.Screen name="profile" component={ProfileScreen} />

  </Tab.Navigator>
  
  )
}