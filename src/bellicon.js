import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Ensure this import is added
import { useNotifications } from '../NotificationContext';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

const NotificationIcon = ({ navigation }) => {
  const { notificationCount, updateNotificationCount } = useNotifications(); // Assuming resetNotificationCount correctly resets the count

  const [fontsLoaded] = useFonts({
    'BebasNeue': require('../assets/fonts/BebasNeue-Regular.ttf'),
    'kanitregular': require('../assets/fonts/Kanit-Regular.ttf'),
  });

  useFocusEffect(
    useCallback(() => {
      const fetchNotificationCount = async () => {
        try {
          const response = await axios.get('/auth/notifications/unread-count');
          updateNotificationCount(response.data.unreadCount);  // Directly update the count
        } catch (error) {
          console.log('Error fetching unread notifications count:', error);
        }
      };

      fetchNotificationCount();
    }, [updateNotificationCount])
  );
  useFocusEffect(
    useCallback(() => {
      const onLayoutRootView = async () => {
        if (fontsLoaded) {
          await SplashScreen.hideAsync();
        }
      };
      
      onLayoutRootView();
    }, [fontsLoaded])
  );

  if (!fontsLoaded) {
    return null;
  }

  const handlePress = async () => {
    await AsyncStorage.setItem('notificationsViewed', 'true');
    navigation.navigate('Notifications');
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.iconContainer}>
      <Ionicons name="notifications" size={24} color="black" />
      {notificationCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{notificationCount}</Text>
        </View>
      )}
      <Text style={styles.notificationText}>Notifications</Text>
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
  notificationText: {
    fontFamily: 'kanitregular', // Apply BebasNeue font
    fontSize: 14, // Adjust the size as needed
  },
});

export default NotificationIcon;









// import React, { useCallback } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import axios from 'axios';
// import { useFocusEffect, useRoute } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNotifications } from '../NotificationContext';

// const NotificationIcon = ({ navigation }) => {
//   const { notificationCount, resetNotificationCount } = useNotifications();
//   const route = useRoute(); // Get the current route

//   const fetchNotificationCount = useCallback(async () => {
//     try {
//       const response = await axios.get('/auth/notifications/unread-count');
//       const notificationsViewed = await AsyncStorage.getItem('notificationsViewed');
//       if (notificationsViewed !== 'true') {
//         resetNotificationCount(response.data.unreadCount);
//       }
//     } catch (error) {
//       console.log('Error fetching unread notifications count:', error);
//     }
//   }, [resetNotificationCount]);

//   const handlePress = async () => {
//     await AsyncStorage.setItem('notificationsViewed', 'true');
//     navigation.navigate('Notifications');
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchNotificationCount();
//     }, [fetchNotificationCount])
//   );

//   const isActive = route.name === "Notifications";
//   const activeColor = '#2ecc71';
//   const inactiveColor = '#000000';

//   return (
//     <TouchableOpacity onPress={handlePress} style={styles.iconContainer}>
//       <Ionicons 
//         name="notifications" 
//         size={24} 
//         color={isActive ? activeColor : inactiveColor} 
//       />
//       {notificationCount > 0 && (
//         <View style={styles.badge}>
//           <Text style={styles.badgeText}>{notificationCount}</Text>
//         </View>
//       )}
//       <Text style={{ color: isActive ? activeColor : inactiveColor }}>Notifications</Text>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   iconContainer: {
//     position: 'relative',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   badge: {
//     position: 'absolute',
//     right: 20,
//     top: 0,
//     backgroundColor: '#AA0000',
//     borderRadius: 8,
//     minWidth: 16,
//     height: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   badgeText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: 'bold',
//     padding: 1,
//     textAlign: 'center',
//   },
// });

// export default NotificationIcon;

// const [unreadCount, setUnreadCount] = useState(0);