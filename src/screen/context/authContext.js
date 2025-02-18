import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  // Global state
  const [state, setState] = useState({
    user: null,
    token: '',
  });

  // Load initial local storage data
  useEffect(() => {
    const loadLocalStorageData = async () => {
      let data = await AsyncStorage.getItem('@auth');
      let loginData = JSON.parse(data);
      if (loginData) {
        setState({ user: loginData.user, token: loginData.token });
      }
    };
    loadLocalStorageData();
  }, []);

  // Persist state changes to AsyncStorage
  useEffect(() => {
    const saveStateToAsyncStorage = async () => {
      if (state.user && state.token) {
        await AsyncStorage.setItem('@auth', JSON.stringify(state));
      } else {
        await AsyncStorage.removeItem('@auth');
      }
    };
    saveStateToAsyncStorage();
  }, [state]);

  // Set axios default settings
  axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
  axios.defaults.baseURL = 'http:///192.168.0.106:8080/api/v1/';

  return (
    <AuthContext.Provider value={[state, setState]}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
