import { View, Text } from 'react-native'
import React from 'react'
import HomeScreen from '../screen/HomeScreen/HomeScreen';
import FavoriteScreen from '../screen/HomeScreen/FavoriteScreen/FavoriteScreen';
import ProfileScreen from '../screen/ProfileScreen/ProfileScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, AntDesign, FontAwesome } from '@expo/vector-icons';
import CoursesScreen from '../screen/CoursesScreen';


const Tab = createBottomTabNavigator();

export default function TabNavigation() {
  return (
    
    <Tab.Navigator>
    <Tab.Screen name="Home" component={HomeScreen} 
     options={{
      tabBarLabel: 'home',
      tabBarIcon: ({ color, size })=>(
        <FontAwesome name="home" size={size} color={color} />
         )
      }} />
        <Tab.Screen name="Courses" component={CoursesScreen}   options={{
      tabBarLabel: 'Courses',
      tabBarIcon: ({ color, size })=>(
        <AntDesign name="profile" size={size} color={color} />
         )
      }} />
    <Tab.Screen name="favorite" component={FavoriteScreen}   options={{
      tabBarLabel: 'Favorite',
      tabBarIcon: ({ color, size })=>(
        <Ionicons name="heart" size={size} color={color} />
         )
      }} />
    <Tab.Screen name="profile" component={ProfileScreen}  options={{
      tabBarLabel: 'Profile',
      tabBarIcon: ({ color, size })=>(
        <FontAwesome name="user-circle" size={size} color={color} />
         )
      }} />

  </Tab.Navigator>
  
  )
}