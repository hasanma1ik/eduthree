import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
  
    useEffect(() => {
      const loadUserData = async () => {
        const storedData = await AsyncStorage.getItem('@auth');
        if (storedData) {
          const { user, token, role } = JSON.parse(storedData); // Assuming role is stored in the same object
          setCurrentUser({ ...user, token, role }); // Combine user, token, and role into one state
        }
      };
      loadUserData();
    }, []);
  
    return (
      <UserContext.Provider value={{ currentUser, setCurrentUser }}>
        {children}
      </UserContext.Provider>
    );
  };

export const useUser = () => useContext(UserContext);
