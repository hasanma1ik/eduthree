// DrawerContent.js
import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { AuthContext } from './screen/context/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DrawerContent = (props) => {
  const [state, setState] = useContext(AuthContext);
  const userRole = state?.user?.role;

  // Logout Functionality
  const handleLogOut = async () => {
    setState({ token: "", user: null });
    await AsyncStorage.removeItem("@auth");
    alert("Logged Out Successfully");
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        {/* Custom drawer content */}
        {userRole === 'teacher' && (
          <>
            <DrawerItem
              label="Attendance"
              onPress={() => props.navigation.navigate('AttendanceScreen')}
              labelStyle={styles.drawerLabel}
            />
            <DrawerItem
              label="Assignments"
              onPress={() => props.navigation.navigate('Assignments', { assignmentId: '65d36a1d36c62925038c6e78' })}
              labelStyle={styles.drawerLabel}
            />
            <DrawerItem
              label="Create Assignment"
              onPress={() => props.navigation.navigate('CreateAssignment')}
              labelStyle={styles.drawerLabel}
            />
            <DrawerItem
              label="My Posts"
              onPress={() => props.navigation.navigate('MyPosts')}
              labelStyle={styles.drawerLabel}
            />
          </>
        )}

        {userRole === 'admin' && (
          <>
            <DrawerItem
              label="Course Creation"
              onPress={() => props.navigation.navigate('CreateClasses')}
              labelStyle={styles.drawerLabel}
            />
            <DrawerItem
              label="Attendance"
              onPress={() => props.navigation.navigate('AttendanceScreen')}
              labelStyle={styles.drawerLabel}
            />
            <DrawerItem
              label="My Posts"
              onPress={() => props.navigation.navigate('MyPosts')}
              labelStyle={styles.drawerLabel}
            />
            <DrawerItem
              label="Grade Setter"
              onPress={() => props.navigation.navigate('GradeSetter')}
              labelStyle={styles.drawerLabel}
            />
            <DrawerItem
              label="Student Form"
              onPress={() => props.navigation.navigate('StudentForm')}
              labelStyle={styles.drawerLabel}
            />
            <DrawerItem
              label="Create Term"
              onPress={() => props.navigation.navigate('AddTermScreen')}
              labelStyle={styles.drawerLabel}
            />
          </>
        )}

        {userRole === 'student' && (
          <>
            <DrawerItem
              label="Class Schedule"
              onPress={() => props.navigation.navigate('ClassSchedule', { userId: state.user.id })}
              labelStyle={styles.drawerLabel}
            />
            <DrawerItem
              label="Assignments"
              onPress={() => props.navigation.navigate('Assignments', { assignmentId: '65d36a1d36c62925038c6e78' })}
              labelStyle={styles.drawerLabel}
            />
          </>
        )}
        
        <DrawerItem
          label="Log Out"
          onPress={() => handleLogOut()}
          labelStyle={styles.drawerLabel}
        />
      </DrawerContentScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerLabel: {
    fontFamily: 'BebasNeue',
    fontSize: 18,
    color: '#2ecc71'
  },
});

export { DrawerContent };
