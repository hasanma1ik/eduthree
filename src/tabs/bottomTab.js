// react-native icons directory

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import { AntDesign } from '@expo/vector-icons';


const BottomTab = () => {
  const navigation = useNavigation()
  const route = useRoute()
  return (
    <View style={styles.container}>
    <TouchableOpacity onPress={()=> navigation.navigate('Home')}>
        <FontAwesome5 name="home" style={styles.iconStyle} color={route.name === "Home" && 'orange'}/>
      <Text>Home</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={()=> navigation.navigate('Messages')}>
    <AntDesign name="message1" style={styles.iconStyle} color={route.name === "Messages" && 'orange'}  />
      <Text>Messages</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={()=> navigation.navigate('Post')}>
    <FontAwesome5 name="plus-square" style={styles.iconStyle} color={route.name === "Post" && 'orange'}/>
      <Text>Post</Text>
    </TouchableOpacity>
    
    {/* <TouchableOpacity onPress={()=> navigation.navigate('MyPosts')}>
    <FontAwesome5 name="list" style={styles.iconStyle} color={route.name === "MyPosts" && 'orange'}/>
      <Text>My Posts</Text>
    </TouchableOpacity> */}

       <TouchableOpacity onPress={()=> navigation.navigate('Account')} color={route.name === "Account" && 'orange'}>
    <FontAwesome5 name="user" style={styles.iconStyle}/>
      <Text>Account</Text>
    </TouchableOpacity>
    </View>
  )
}
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
  })
  

export default BottomTab;