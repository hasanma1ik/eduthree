import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { useNotifications } from '../../NotificationContext';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const { resetNotificationCount } = useNotifications();

  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications();
      const resetCount = async () => {
        await resetNotificationCount(0);
      };
      resetCount();
      return () => {};
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
      const updatedNotifications = notifications.map((notification) =>
        notification._id === notificationId ? { ...notification, read: true } : notification
      );
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const [fontsLoaded] = useFonts({
    'Kanit-Medium': require('../../assets/fonts/Kanit-Medium.ttf'),
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
    backgroundColor: 'black',
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontFamily: 'Kanit-Medium',
    color: 'white',
    marginBottom: 20,
  },
  notificationItem: {
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555555',
  },
  unreadNotification: {
    backgroundColor: '#444444',
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationMessage: {
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
    color: 'white',
    flexShrink: 1,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6347',
    marginLeft: 10,
  },
});

export default NotificationsScreen;
