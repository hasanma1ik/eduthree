import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      const storedData = await AsyncStorage.getItem('@auth');
      if (storedData) {
        const userData = JSON.parse(storedData);
        setCurrentUser(userData.user); // Assuming userData.user contains the user object
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
