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
        headerShown: true,
        // For home screens, align title to left; otherwise center.
        headerTitleAlign: (
          (userRole === 'student' && route.name === 'StudentHome') ||
          (userRole === 'admin' && route.name === 'AdminHome') ||
          (userRole === 'teacher' && route.name === 'TeacherHome')
        ) ? 'left' : 'center',
        // For non-home screens, set header background.
        headerStyle: (
          (userRole === 'student' && route.name === 'StudentHome') ||
          (userRole === 'admin' && route.name === 'AdminHome') ||
          (userRole === 'teacher' && route.name === 'TeacherHome')
        ) ? {} : { backgroundColor: '#006A4E' },
        headerLeft: () => {
          // For home screens, drawer icon is black; otherwise white.
          const isHome =
            (userRole === 'student' && route.name === 'StudentHome') ||
            (userRole === 'admin' && route.name === 'AdminHome') ||
            (userRole === 'teacher' && route.name === 'TeacherHome');
          const drawerIconColor = isHome ? 'black' : 'white';
          return (
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
              <Icon name="bars" size={20} color={drawerIconColor} style={{ marginLeft: 10 }} />
            </TouchableOpacity>
          );
        },
        headerTitle: () => {
          const tab = getTabs().find((t) => t.name === route.name);
          if (
            (userRole === 'student' && route.name === 'StudentHome') ||
            (userRole === 'admin' && route.name === 'AdminHome') ||
            (userRole === 'teacher' && route.name === 'TeacherHome')
          ) {
            let title;
            if (userRole === 'student') title = 'Student Portal';
            else if (userRole === 'admin') title = 'Admin Portal';
            else if (userRole === 'teacher') title = 'Faculty Portal';
            return (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={require('./../../assets/lalogo.jpg')}
                  style={{ width: 60, height: 40, marginRight: 10 }}
                  resizeMode="contain"
                />
                <Text style={{ fontSize: 24, fontFamily: 'BebasNeue', color: 'green' }}>
                  {title}
                </Text>
              </View>
            );
          }
          return (
            <Text style={{ fontSize: 24, color: 'white', fontFamily: 'BebasNeue' }}>
              {tab?.title || route.name}
            </Text>
          );
        },
        tabBarIcon: ({ color, size }) => {
          const tab = getTabs().find((t) => t.name === route.name);
          return tab ? <FontAwesome5 name={tab.icon} size={size} color={color} /> : null;
        },
        tabBarActiveTintColor: '#004d40', // Active tab color
        tabBarInactiveTintColor: '#757575', // Inactive tab color
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
