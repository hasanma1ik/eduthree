import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSocket } from './socketservice'; // Ensure the path to socketService is correct
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

const LOCAL_STORAGE_KEY = 'notificationCount';

const getNotificationCountAsync = async () => {
  try {
      const count = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
      console.log("Retrieved count from AsyncStorage:", count);
      return count !== null ? parseInt(count, 10) : 0;
  } catch (e) {
      console.error("Error fetching notification count from AsyncStorage:", e);
      return 0;
  }
};

const setNotificationCountAsync = async (count) => {
  try {
      await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(count));
      console.log("Updated count in AsyncStorage:", count);
  } catch (e) {
      console.error("Error updating notification count in AsyncStorage:", e);
  }
};

export const NotificationProvider = ({ children }) => {
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
      const init = async () => {
        const storedCount = await getNotificationCountAsync();
        console.log(`Retrieved count from AsyncStorage: ${storedCount}`);
        setNotificationCount(storedCount);
      };
    
      init();
    
      const socket = getSocket();
      console.log("Setting up socket listeners for notifications");
      const onNotificationReceived = (notification) => {
        // Assuming your notification object has a 'type' property that identifies the notification type
        if (notification.type === 'classReminder') {
          console.log("Class reminder received:", notification);
          setNotificationCount(prevCount => {
            const newCount = prevCount + 1;
            console.log(`Updating count in AsyncStorage due to class reminder: ${newCount}`);
            setNotificationCountAsync(newCount);
            return newCount;
          });
        } else {
          console.log("Received non-class reminder notification:", notification);
        }
      };
    
      socket.on("notification-channel", onNotificationReceived);
    
      return () => {
        console.log("Cleaning up socket listeners");
        socket.off("notification-channel", onNotificationReceived);
      };
    }, []);
    
    const updateNotificationCount = async (count) => {
      setNotificationCount(count);
      await setNotificationCountAsync(count);
    };
    
    const resetNotificationCount = async () => {
      await setNotificationCountAsync(0); // Reset the count in AsyncStorage
      await AsyncStorage.setItem('notificationsViewed', 'true'); // Set a flag that notifications have been viewed
      setNotificationCount(0); // Reset the state
    };

    return (
        <NotificationContext.Provider value={{ notificationCount, updateNotificationCount, resetNotificationCount }}>
            {children}
        </NotificationContext.Provider>
    );
};
