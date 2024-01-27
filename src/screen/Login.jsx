import { View, Text, TextInput, StyleSheet, Alert } from 'react-native'
import React, { useState,useContext } from "react";
import { AuthContext } from './context/authContext';
import InputBox from '../InputBox'
import SubmitButton from '../SubmitButton'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useUser } from './context/userContext';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Use UserContext to set the current user
  const { setCurrentUser } = useUser();

  // Global state from AuthContext
  const [state, setState] = useContext(AuthContext);

  const handleSubmit = async () => {
      try {
          setLoading(true);
          if (!email || !password) {
              Alert.alert("Please Fill All Fields");
              setLoading(false);
              return;
          }

          const { data } = await axios.post('/auth/login', { email, password });

          if (data && data.user) {
              // Update context
              setCurrentUser(data.user);
              setState({ ...state, user: data.user, token: data.token });

              // Save to AsyncStorage
              await AsyncStorage.setItem('@auth', JSON.stringify(data));
              

              // Navigate to Home
              navigation.navigate('Home');
          } else {
              Alert.alert("Login failed", "Invalid response from server");
          }

          setLoading(false);
      } catch (error) {
          Alert.alert("Login Error", error.response.data.message);
          setLoading(false);
      }
  };

  //  temporary function to check local storage data
   const getLocalStorageData = async () => {
    let data = await AsyncStorage.getItem("@auth");
    console.log("Local Storage ==> ", data);
  };
  getLocalStorageData();

    return (
     
      <View style={styles.container}>
        <Text style={styles.pageTitle}>LoginScreen</Text>
        <View style={{ marginHorizontal:20 }}>
        <InputBox inputTitle={"Email"} keyboardType="email-address" autoComplete="email" value={email} setValue={setEmail}/>
        <InputBox inputTitle={"Password"} secureTextEntry={true} autoComplete="password" value={password} setValue={setPassword}/>
  
        </View>
        {/* <Text>{JSON.stringify({ name, email, password }, null, 4)}</Text> */}
        <SubmitButton btnTitle="Login" loading={loading} handleSubmit={handleSubmit} />
        <Text style={styles.linkText}>Not a User Please {" "} <Text style ={styles.link} onPress={()=>navigation.navigate("Register")}>Register</Text></Text>
        
      </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: 'white',
    },
    pageTitle:{
        fontSize:40,
        fontWeight: 'bold',
        textAlign: 'center',
        color: "#1e2225"
    },
    inputBox: {
        height: 40,
        marginBottom: 20,
        backgroundColor: '#ffffff',
        borderRadius : 10,
        marginTop: 10,
        paddingLeft:10,
        color: "#af9f85",
    },
    linkText: {
        textAlign: "center",
      },
      link: {
        color: "red",
      },
})


export default Login