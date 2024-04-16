import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Ensure this import is added
import { useNotifications } from '../NotificationContext';

const NotificationIcon = ({ navigation }) => {
  const { notificationCount, resetNotificationCount } = useNotifications(); // Assuming resetNotificationCount correctly resets the count

  const fetchNotificationCount = useCallback(async () => {
    try {
      const response = await axios.get('/auth/notifications/unread-count');
      const notificationsViewed = await AsyncStorage.getItem('notificationsViewed');
      if (notificationsViewed !== 'true') {
        resetNotificationCount(response.data.unreadCount); // Use the correct context function here
      }
    } catch (error) {
      console.log('Error fetching unread notifications count:', error);
    }
  }, [resetNotificationCount]);

  const handlePress = async () => {
    await AsyncStorage.setItem('notificationsViewed', 'true');
    navigation.navigate('Notifications');
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotificationCount();
    }, [fetchNotificationCount])
  );

  return (
    <TouchableOpacity onPress={handlePress} style={styles.iconContainer}>
      <Ionicons name="notifications" size={24} color="black" />
      {notificationCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{notificationCount}</Text>
        </View>
      )}
      <Text>Notifications</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: 20,
    top: 0,
    backgroundColor: '#AA0000',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    padding: 1,
    textAlign: 'center',
  },
});

export default NotificationIcon;




// const [unreadCount, setUnreadCount] = useState(0);