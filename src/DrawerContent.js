import React, { useContext } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { AuthContext } from './screen/context/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';

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
    <View style={styles.container}>
      <DrawerContentScrollView {...props}>
        {/* Header with User Info */}
        <View style={styles.header}>
          <Image
            source={{
              uri: state?.user?.profilePicture || 'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png',
            }}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{state?.user?.name || 'User'}</Text>
          <Text style={styles.userRole}>{userRole ? userRole.toUpperCase() : ''}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Common drawer content for all roles */}
        <DrawerItem
          label="Home"
          onPress={() => props.navigation.navigate('Home')}
          labelStyle={styles.drawerLabel}
          icon={() => <Icon name="home" size={20} color="#4E9F3D" />}
        />
        <DrawerItem
          label="Account"
          onPress={() => props.navigation.navigate('Account')}
          labelStyle={styles.drawerLabel}
          icon={() => <Icon name="user" size={20} color="#3F72AF" />}
        />
        <DrawerItem
          label="Change Password"
          onPress={() => props.navigation.navigate('ChangePasswordScreen')}
          labelStyle={styles.drawerLabel}
          icon={() => <Icon name="lock" size={20} color="#FF5722" />}
        />
        <DrawerItem
          label="My Posts"
          onPress={() => props.navigation.navigate('MyPosts')}
          labelStyle={styles.drawerLabel}
          icon={() => <Icon name="pencil-alt" size={20} color="#FF5722" />}
        />
      </DrawerContentScrollView>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => handleLogOut()}>
        <Icon name="sign-out-alt" size={20} color="white" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1F8A70',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    marginBottom: 15,
  },
  userName: {
    fontSize: 22,
    fontFamily: 'Kanit-Medium',
    color: 'white',
  },
  userRole: {
    fontSize: 14,
    fontFamily: 'Kanit-Medium',
    color: 'white',
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  drawerLabel: {
    fontFamily: 'Kanit-Medium',
    fontSize: 16,
    color: '#333333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D7263D',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  logoutText: {
    fontFamily: 'Kanit-Medium',
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
  },
});

export { DrawerContent };
