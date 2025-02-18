import React, { useContext } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { AuthContext } from './screen/context/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';

const DrawerContent = (props) => {
  const [state, setState] = useContext(AuthContext);
  const userRole = state?.user?.role;

  // Get First Name
  const fullName = state?.user?.name || 'User';
  const firstName = fullName.split(' ')[0];

  // Get Profile Picture (Fallback to Default)
  const profilePicture = state?.user?.profilePicture ||
    'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png';

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
          <TouchableOpacity onPress={() => props.navigation.navigate('Account')}>
            <Image source={{ uri: profilePicture }} style={styles.profileImage} />
          </TouchableOpacity>
          <Text style={styles.userName}>{state?.user?.name || 'User'}</Text>
          <Text style={styles.userRole}>{userRole ? userRole.toUpperCase() : ''}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Drawer Items */}
        <DrawerItem
          label="Home"
          onPress={() => props.navigation.navigate('Home')}
          labelStyle={styles.drawerLabel}
          icon={() => <Icon name="home" size={20} color="#018749" />}
        />
        <DrawerItem
          label="Account"
          onPress={() => props.navigation.navigate('Account')}
          labelStyle={styles.drawerLabel}
          icon={() => <Icon name="user" size={20} color="#0077B6" />}
        />
        <DrawerItem
          label="Change Password"
          onPress={() => props.navigation.navigate('ChangePasswordScreen')}
          labelStyle={styles.drawerLabel}
          icon={() => <Icon name="lock" size={20} color="#F4A261" />}
        />
        <DrawerItem
          label="My Posts"
          onPress={() => props.navigation.navigate('MyPosts')}
          labelStyle={styles.drawerLabel}
          icon={() => <Icon name="pencil-alt" size={20} color="#E63946" />}
        />
      </DrawerContentScrollView>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogOut}>
        <Icon name="sign-out-alt" size={20} color="white" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  header: {
    backgroundColor: '#018749',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: 'white',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  userName: {
    fontSize: 22,
    fontFamily: 'Kanit-Medium',
    color: 'white',
  },
  userRole: {
    fontSize: 14,
    fontFamily: 'Kanit-Medium',
    color: '#CFF4D2',
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#D3D3D3',
    marginVertical: 10,
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  logoutText: {
    fontFamily: 'Kanit-Medium',
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
  },
});

export { DrawerContent };
