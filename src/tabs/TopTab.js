import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, {useContext} from 'react'
import { AuthContext } from '../screen/context/authContext'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import AsyncStorage from '@react-native-async-storage/async-storage'



const TopTab = () => {
    const[state, setState] = useContext(AuthContext)
    // Logout Functionality

    const handleLogOut = async () => {
        setState({ token: "", user: null });
        await AsyncStorage.removeItem("@auth");
        alert("logged Out Successfully");
      };

  return (
    <View>
      <TouchableOpacity onPress={handleLogOut}>
      {/* <FontAwesome5 name="sign-out-alt" color={"maroon"} style={styles.iconStyle}/> */}

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
  


export default TopTab