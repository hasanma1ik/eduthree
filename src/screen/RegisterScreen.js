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
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './context/authContext';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [state, setState] = useContext(AuthContext);

  const handleRegister = async () => {
    try {
      setLoading(true);
      if (!name || !email || !password || !role) {
        Alert.alert('Error', 'Please fill in all required fields.');
        setLoading(false);
        return;
      }

      // Include role and verificationCode in the POST request
      const payload = { name, email, password, role };
      if (role === 'teacher' || role === 'admin') {
        payload.verificationCode = verificationCode;
      }

      const { data } = await axios.post('/auth/register', payload);

      if (data.success) {
        Alert.alert('Success', 'Registration successful! Please log in.');
        navigation.navigate('Login1'); // Navigate to Login screen after registration
      } else {
        Alert.alert('Registration Failed', data.message || 'An error occurred during registration.');
      }

      setLoading(false);
    } catch (error) {
      Alert.alert('Registration Error', error.response?.data?.message || 'An unexpected error occurred.');
      console.error('Registration error:', error);
      setLoading(false);
    }
  };

  // Dynamic button color based on input validation
  const buttonColor =
    name.length > 0 && email.length > 0 && password.length > 0 && role.length > 0
      ? '#ff0000' // Active: Red
      : 'black'; // Inactive: Maroon

  return (
    <ImageBackground
      source={require('../../assets/edupic2.png')}
      style={styles.fullScreenBackground}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.mainTitle}>Learn Academy</Text>
          <Text style={styles.title}>Register</Text>

          {/* Name Input */}
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
            placeholderTextColor="#ccc"
            autoCapitalize="words"
          />

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

          {/* Role Picker */}
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={role}
              onValueChange={(itemValue) => setRole(itemValue)}
              style={styles.picker}
              dropdownIconColor="#fff"
              mode="dropdown"
            >
              <Picker.Item label="Select Role" value="" />
              <Picker.Item label="Student" value="student" />
              <Picker.Item label="Teacher" value="teacher" />
              <Picker.Item label="Admin" value="admin" />
            </Picker>
          </View>

          {/* Conditionally render verification code input for teachers and admins */}
          {(role === 'teacher' || role === 'admin') && (
            <TextInput
              style={styles.input}
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="Verification Code"
              placeholderTextColor="#ccc"
              autoCapitalize="none"
            />
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: buttonColor }]}
            onPress={handleRegister}
            disabled={loading || !(name && email && password && role)}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          {/* Link to Login */}
          <TouchableOpacity onPress={() => navigation.navigate("Login1")}>
            <Text style={styles.textLink}>
              Already Registered? <Text style={styles.link}>LOGIN</Text>
            </Text>
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
    // backgroundColor: 'rgba(255, 255, 255, 0.1)', // Slightly transparent container
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
    fontFamily: 'BebasNeue',
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
  pickerContainer: {
    width: '100%',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#fff',
  },
  button: {
    padding: 12,
    borderRadius: 5,
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
  link: {
    color: '#ff0000', // Red color for link text
  },
});
