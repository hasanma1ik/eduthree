import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as WebBrowser from "expo-web-browser";
import { AuthContext } from './screen/context/authContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

WebBrowser.maybeCompleteAuthSession();

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useContext(AuthContext);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false); // Loading state

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
  };

  // Dynamic button color based on input validation
  const buttonColor = email.length > 0 && password.length > 0 ? '#ff0000' : 'black'; // Active: Red, Inactive: Maroon

  return (
    <ImageBackground 
      source={require('./../assets/edupic3.png')}
      style={styles.fullScreenBackground}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.mainTitle}>Learn Academy</Text>
          <Text style={styles.title}>Login</Text>

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

          {/* Password Input */}
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry={true}
            placeholderTextColor="#ccc"
          />

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: buttonColor }]}
            onPress={handleLogin}
            disabled={email.length === 0 || password.length === 0 || loading} // Disable button during loading
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* OR Divider */}
         

          {/* Forgot Password Link */}
          <Text
            style={styles.textLink}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            Forgot password?
          </Text>

          {/* Register Link */}
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.textLink}>Don't have an account? REGISTER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fullScreenBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark overlay for readability
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0)', // Slightly transparent container for better readability
  },
  mainTitle: {
    fontSize: 42,
    color: '#fff', // White color for title text
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'Kanit-Medium',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Kanit-Medium',
  },
  input: {
    width: '100%',
    marginVertical: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  button: {
    padding: 12,
    borderRadius: 5,
    backgroundColor: '#ff0000', // Red color for active button
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
  },
  orStyle: {
    color: '#fff', // White color for "or" text
    fontSize: 16,
    fontFamily: 'outfit-bold',
    marginVertical: 10,
  },
  textLink: {
    color: '#fff',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    fontFamily: 'Kanit-Medium',
    textDecorationLine: 'underline',
  },
});
