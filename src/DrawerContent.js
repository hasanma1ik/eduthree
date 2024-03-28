// DrawerContent.js
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { AuthContext } from './screen/context/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage'


const DrawerContent = (props) => {
    const[state, setState] = useContext(AuthContext)
    const userRole = state?.user?.role;
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
        {userRole === 'teacher' && (
        <>
 
        <DrawerItem label="Attendance" onPress={() => props.navigation.navigate('AttendanceScreen')}/>
        <DrawerItem label="Course Creation" onPress={() => props.navigation.navigate('CreateClasses')}/>
        <DrawerItem label="Student Form" onPress={() => props.navigation.navigate('StudentForm')} />
        <DrawerItem label="My Posts" onPress={() => props.navigation.navigate('MyPosts')} />
        <DrawerItem label="Grade Setter" onPress={() => props.navigation.navigate('GradeSetter')} />
        <DrawerItem label="Create Assignment" onPress={() => props.navigation.navigate('CreateAssignment')} />

        </>
      )}

{userRole === 'student' && (
        <>

        <DrawerItem label="Class Schedule" onPress={() =>  props.navigation.navigate('ClassSchedule', {userId: state.user.id})} />
        </>
      )}
        <DrawerItem label="Assignments" onPress={() => props.navigation.navigate('Assignments' , { assignmentId: '65d36a1d36c62925038c6e78' })} />
        
        <DrawerItem label="Log Out" onPress={() =>  handleLogOut()} />

      </DrawerContentScrollView>
    </View>
  );
};

export { DrawerContent };
