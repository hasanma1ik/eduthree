import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { useNotifications } from '../../NotificationContext';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';



const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const { resetNotificationCount } = useNotifications(); // Use the context

  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications();
      const resetCount = async () => {
        await resetNotificationCount(0); // Reset notification count when screen is focused
      };
      resetCount();
      return () => {}; // Optional cleanup actions
    }, [])
  );

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/auth/notifications');
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.post(`/auth/notifications/${notificationId}/mark-read`);
      const updatedNotifications = notifications.map(notification =>
        notification._id === notificationId ? { ...notification, read: true } : notification
      );
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };
  const [fontsLoaded] = useFonts({
    'kanitmedium': require('../../assets/fonts/Kanit-Medium.ttf'),
  });

  const onLayoutRootView = React.useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }



  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <Text style={styles.heading}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.notificationItem,
              !item.read ? styles.unreadNotification : {},
            ]}
            onPress={() => markNotificationAsRead(item._id)}
          >
            <View style={styles.notificationContent}>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              {!item.read && <View style={styles.unreadIndicator} />}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5', // Light gray background for the whole screen
  },
  heading: {
    fontSize: 24,
    fontFamily: 'kanitmedium', // Use Kanit Medium font for the heading
    color: 'black',
    marginLeft: 20,
    marginVertical: 20,
  },
  notificationItem: {
    backgroundColor: '#ffffff', // White background for each item
    padding: 15,
    borderRadius: 10, // Rounded corners for each notification
    marginVertical: 5,
    marginHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000', // Shadow for depth
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unreadNotification: {
    backgroundColor: '#eef2ff', // Slightly different background for unread notifications
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationMessage: {
    fontSize: 16,
    color: '#333',
    // fontWeight: 'bold',
    flexShrink: 1, // Ensure text does not push other elements out of view
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6347', // Tomate color for a noticeable indicator
    marginLeft: 10,
  },
});

export default NotificationsScreen;