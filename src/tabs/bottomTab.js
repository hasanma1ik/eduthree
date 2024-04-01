// react-native icons directory
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useContext } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../screen/context/authContext';
import NotificationIcon from '../bellicon';


const BottomTab = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [state, setState] = useContext(AuthContext);
  const userRole = state?.user?.role;
  


  // Debugging log to check the user role
  console.log("User role is: ", userRole);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <FontAwesome5 name="home" style={styles.iconStyle} color={route.name === "Home" ? 'orange' : undefined} />
        <Text>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Messages')}>
        <AntDesign name="message1" style={styles.iconStyle} color={route.name === "Messages" ? 'orange' : undefined} />
        <Text>Messages</Text>
      </TouchableOpacity>

      {userRole === 'teacher'|| userRole === 'admin' && (
        <TouchableOpacity onPress={() => navigation.navigate('Post')}>
          <FontAwesome5 name="plus-square" style={styles.iconStyle} color={route.name === "Post" ? 'orange' : undefined} />
          <Text>Post</Text>
        </TouchableOpacity>
      )}

      <NotificationIcon navigation={navigation} />

      <TouchableOpacity onPress={() => navigation.navigate('Account')}>
        <FontAwesome5 name="user" style={styles.iconStyle} color={route.name === "Account" ? 'orange' : undefined} />
        <Text>Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    margin: 10,
    justifyContent: "space-between",
  },
  iconStyle: {
    marginBottom: 3,
    alignSelf: "center",
    fontSize: 25,
  },
});

export default BottomTab;