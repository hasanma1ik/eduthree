// react-native icons directory
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useContext } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import { AntDesign } from '@expo/vector-icons';
import { AuthContext } from '../screen/context/authContext';
import NotificationIcon from '../bellicon';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen'

const BottomTab = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [state, setState] = useContext(AuthContext);
  const userRole = state?.user?.role;

  // Debugging log to check the user role
  console.log("User role is: ", userRole);

  const [fontsLoaded] = useFonts({
    'BebasNeue': require('../../assets/fonts/BebasNeue-Regular.ttf'),
    'kanitregular': require('../../assets/fonts/Kanit-Regular.ttf'),
    'kanitmedium': require('../../assets/fonts/Kanit-Medium.ttf')

  })

const onLayoutRootView = React.useCallback(async () =>{
  if (fontsLoaded){
    await SplashScreen.hideAsync()
  }
}, [fontsLoaded]);

if(!fontsLoaded) {
  return null
}

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <FontAwesome5 
          name="home" 
          style={styles.iconStyle} 
          color={route.name === "Home" ? styles.activeColor.color : styles.inactiveColor.color} 
        />
        <Text style={[route.name === "Home" ? styles.activeColor : styles.inactiveColor, styles.labelStyle]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Messages')}>
        <AntDesign 
          name="message1" 
          style={styles.iconStyle} 
          color={route.name === "Messages" ? styles.activeColor.color : styles.inactiveColor.color} 
        />
        <Text style={[route.name === "Messages" ? styles.activeColor : styles.inactiveColor, styles.labelStyle]}>Messages</Text>
      </TouchableOpacity>

      {(userRole === 'teacher' || userRole === 'admin') && (
        <TouchableOpacity onPress={() => navigation.navigate('Post')}>
          <FontAwesome5 
            name="plus-square" 
            style={styles.iconStyle} 
            color={route.name === "Post" ? styles.activeColor.color : styles.inactiveColor.color} 
          />
          <Text style={[route.name === "Post" ? styles.activeColor : styles.inactiveColor, styles.labelStyle]}>Post</Text>
        </TouchableOpacity>
      )}

      <NotificationIcon navigation={navigation} />

      <TouchableOpacity onPress={() => navigation.navigate('Account')}>
        <FontAwesome5 
          name="user" 
          style={styles.iconStyle} 
          color={route.name === "Account" ? styles.activeColor.color : styles.inactiveColor.color} 
        />
        <Text style={[route.name === "Account" ? styles.activeColor : styles.inactiveColor, styles.labelStyle]}>Account</Text>
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
  activeColor: {
    color: '#2ecc71', // vibrant green
  },
  inactiveColor: {
    color: '#000000', // black for inactive icons and labels
  },
labelStyle: {
  fontFamily: 'kanitregular',
  fontSize: 14,
},
});

export default BottomTab;
