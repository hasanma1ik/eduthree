import { View, Text, TextInput, StyleSheet, Alert, Button, Modal } from 'react-native'
import React, { useState,useContext } from "react";
import { AuthContext } from './context/authContext';
import InputBox from '../InputBox'
import LoginButton from '../LoginButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useUser } from './context/userContext';
import { TouchableOpacity } from 'react-native-gesture-handler';

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
            //   navigation.navigate('Home');
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
        <Text style={styles.pageTitle}>Login</Text>
        <View style={styles.inputContainer}>
        <InputBox inputTitle={"Email"} keyboardType="email-address" autoComplete="email" value={email} setValue={setEmail} icon="envelope"/>
        <InputBox inputTitle={"Password"} secureTextEntry={true} autoComplete="password" value={password} setValue={setPassword} icon="lock"/>
  
        </View>
        {/* <Text>{JSON.stringify({ name, email, password }, null, 4)}</Text> */}

        
        <LoginButton btnTitle="Submit" loading={loading} handleSubmit={handleSubmit} textStyle={styles.loginButtonText}  />
        

        <TouchableOpacity onPress={()=> navigation.navigate("Register")}>
            <Text style={styles.linkText}>
                Not a user please <Text style={styles.link}>Register</Text>
            </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate("ForgetPassword")}>
            <Text style={styles.forgetPasswordLink}>Forget Password</Text>
        </TouchableOpacity>


      </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: '#F5F5F5',
        padding: 20,
    },
    loginButtonText: {
        fontFamily: 'outfit-bold',
      },

   
    pageTitle:{
        fontSize: 24,
        fontFamily: 'outfit-bold',
        textAlign: 'center',
        color: "#1e2225",
        marginBottom: 20,
        
    },
    inputContainer: {
        marginHorizontal: 20,
      },
      logo: {
        width: 100,
        height: 100,
        marginBottom: 20,
        alignSelf: 'center',
      },

   
    logo: {
        width: 100,
        height: 100,
        marginBottom: 20,
        alignSelf: 'center',
      },
      link: {
        color: "#007BFF",
        fontWeight: 'bold',
      },
      

      link: {
        color: "#007BFF",
        fontWeight: 'bold',
      },
      forgetPasswordLink:{
        textAlign: "center",
        color: "#007BFF",
        marginTop: 20,
        fontWeight: 'bold',
      }
})


export default Login