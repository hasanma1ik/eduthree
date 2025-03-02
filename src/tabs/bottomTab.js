import React, { useContext } from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext } from '../screen/context/authContext';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AdminHome from '../screen/adminhome';
import TeacherHome from '../screen/teacherhome';
import Home from '../screen/Home';
import Announcements from '../screen/announcements';
import Post from '../screen/Post';
import Account from '../screen/Account';
import ClassSchedule from '../ClassSchedule';

const Tab = createBottomTabNavigator();

export default function BottomTab() {
  const [state] = useContext(AuthContext);
  const userRole = state?.user?.role;

  // Define role-specific tabs
  const getTabs = () => {
    if (userRole === 'admin') {
      return [
        { name: 'AdminHome', title: 'Home', component: AdminHome, icon: 'home' },
        { name: 'Announcements', component: Announcements, icon: 'bullhorn' },
        { name: 'Post', component: Post, icon: 'plus-square' },
        { name: 'Account', component: Account, icon: 'user' },
      ];
    } else if (userRole === 'teacher') {
      return [
        { name: 'TeacherHome', title: 'Home', component: TeacherHome, icon: 'home' },
        { name: 'Announcements', component: Announcements, icon: 'bullhorn' },
        { name: 'Post', component: Post, icon: 'plus-square' },
        { name: 'Account', component: Account, icon: 'user' },
      ];
    } else if (userRole === 'student') {
      return [
        { name: 'StudentHome', title: 'Home', component: Home, icon: 'home' },
        { name: 'Announcements', component: Announcements, icon: 'bullhorn' },
        { name: 'Schedule', component: ClassSchedule, icon: 'calendar-alt' },
        { name: 'Account', component: Account, icon: 'user' },
      ];
    }
    return [];
  };

  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        header: () => null, // Remove header completely
        tabBarIcon: ({ color, size }) => {
          const tab = getTabs().find((t) => t.name === route.name);
          return tab ? <FontAwesome5 name={tab.icon} size={size} color={color} /> : null;
        },
        tabBarActiveTintColor: '#004d40',
        tabBarInactiveTintColor: '#757575',
      })}
    >
      {getTabs().map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{ title: tab.title || tab.name }}
        />
      ))}
    </Tab.Navigator>
  );
}
