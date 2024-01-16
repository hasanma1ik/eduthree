// DrawerContent.js
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { AuthContext } from './screen/context/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage'


const DrawerContent = (props) => {
    const[state, setState] = useContext(AuthContext)
    // Logout Functionality

    const handleLogOut = async () => {
        setState({ token: "", user: null });
        await AsyncStorage.removeItem("@auth");
        alert("logged Out Successfully");
      };
  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        {/* Your custom drawer content goes here */}
 
        <DrawerItem label="My Posts" onPress={() => props.navigation.navigate('MyPosts')} />
        <DrawerItem label="Log Out" onPress={() =>  handleLogOut()} />

      </DrawerContentScrollView>
    </View>
  );
};

export { DrawerContent };
