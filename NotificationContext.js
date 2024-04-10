import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSocket } from './socketservice'; // Ensure the path to socketService is correct
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

const LOCAL_STORAGE_KEY = 'notificationCount';

const getNotificationCountAsync = async () => {
  try {
    const count = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
    return count !== null ? parseInt(count, 10) : 0;
  } catch (e) {
    console.error(e);
    return 0; // In case of error, default to 0
  }
};

const setNotificationCountAsync = async (count) => {
  try {
    await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(count));
  } catch (e) {
    console.error(e);
  }
};

export const NotificationProvider = ({ children }) => {
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        const init = async () => {
            const storedCount = await getNotificationCountAsync();
            setNotificationCount(storedCount);
        };

        init();

        const socket = getSocket();

        const onNotificationReceived = (notification) => {
            setNotificationCount(prevCount => {
                const newCount = prevCount + 1;
                setNotificationCountAsync(newCount);
                return newCount;
            });
            console.log(notification.message);
        };

        socket.on("notification-channel", onNotificationReceived);

        return () => {
            socket.off("notification-channel", onNotificationReceived);
        };
    }, []);

    const resetNotificationCount = async () => {
        await setNotificationCountAsync(0);
        setNotificationCount(0);
    };

    return (
        <NotificationContext.Provider value={{ notificationCount, resetNotificationCount }}>
            {children}
        </NotificationContext.Provider>
    );
};
