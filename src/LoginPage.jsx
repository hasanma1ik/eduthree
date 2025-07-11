import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Alert,
} from 'react-native';
import * as WebBrowser from "expo-web-browser";
import { AuthContext } from './screen/context/authContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useContext(AuthContext);
  const [loading, setLoading] = useState(false); // Loading state
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Error', 'Please fill in both email and password.');
        return;
      }
      setLoading(true); // Start loading
      const { data } = await axios.post('/auth/login', { email, password });
      if (data && data.user) {
        setState((prevState) => {
          const updatedState = {
            ...prevState,
            user: data.user,
            token: data.token,
            isDriver: data.user.isDriver,
          };
          AsyncStorage.setItem('@auth', JSON.stringify(updatedState));
          return updatedState;
        });
        // Optionally navigate to HomeScreen
        // navigation.navigate('HomeScreen');
      } else {
        Alert.alert('Login failed', 'Invalid response from server');
      }
    } catch (error) {
      Alert.alert('Login Error', error.response?.data?.message || error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  }

  // Dynamic button color based on input validation
  const buttonColor = email.length > 0 && password.length > 0 ? '#ff0000' : 'black'; // Active: Red, Inactive: Maroon

  return (
    <View style={styles.container}>
      {/* Top half with background image */}
      <ImageBackground 
        source={require('./../assets/edupic3.jpg')}
        style={styles.topHalf}
        resizeMode="cover"
      >
        <View style={styles.logoContainer}>
          <Image 
            source={require('./../assets/learn-logo-transparent.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.heading}>Learn Academy</Text>
        </View>
      </ImageBackground>

      {/* Bottom half with login form */}
      <View style={styles.bottomHalf}>
        <Text style={styles.loginTitle}>LOG IN TO YOUR CLASSROOM</Text>

          {/* Email Input */}
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#ccc"
            keyboardType="email-address"
            autoCapitalize="none"
          />

        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry={true}
          placeholderTextColor="#ccc"
        />

        <Text style={styles.forgotPassword} onPress={() => navigation.navigate('ForgetPassword')}
          >
            Forgot password?
          </Text>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>SIGN IN NOW</Text>
        </TouchableOpacity>

        <Text style={styles.registerText}>
          Don't have an account? <Text style={styles.registerLink} onPress={() => navigation.navigate('Register')}>Register Now</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHalf: {
    flex: 1,
    width: '110%',
    height: '150%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingLeft: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 50,  // Adjust logo size as needed
    height: 50, 
    marginRight: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  bottomHalf: {
    flex: 1,
    backgroundColor: '#006446',  // Green background color #174D3A
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 30,
    paddingTop: 40,
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    color: 'white',
    fontSize: 14,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#00E678', // Green button color #00C853
    width: '80%',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: -60, // 


  },
  buttonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'black',
  },
  registerText: {
    color: 'white',
    marginTop: 20,
    fontSize: 14,
  },
  registerLink: {
    fontWeight: 'bold',
    color: '#00C853',
  },
});

