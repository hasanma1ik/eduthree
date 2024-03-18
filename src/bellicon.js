import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons'; // Or wherever you import Ionicons from

const NotificationIcon = ({ navigation }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        // Replace with your actual API call
        const response = await axios.get('/auth/notifications/unread-count');
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.log('Error fetching unread notifications count:', error);
      }
    };

    fetchUnreadCount();
  }, []);

  return (
    <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.iconContainer}>
      <Ionicons name="notifications" size={24} color="black" />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount}</Text>
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
    right: -6,
    top: 0,
    backgroundColor: 'red',
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
