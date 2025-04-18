import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
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

      const payload = { name, email, password, role };
      if (role === 'teacher' || role === 'admin') {
        payload.verificationCode = verificationCode;
      }

      const { data } = await axios.post('/auth/register', payload);

      if (data.success) {
        Alert.alert('Success', 'Registration successful! Please log in.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Registration Failed', data.message || 'An error occurred during registration.');
      }

      setLoading(false);
    } catch (error) {
      Alert.alert('Registration Error', error.response?.data?.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={require('../../assets/edupic2.jpg')} style={styles.image} />

        <View style={styles.logoContainer}>
                  <Image 
                    source={require('../../assets/learn-logo-transparent.png')} 
                    style={styles.logo}
                    resizeMode="contain"
                  />
                  <Text style={styles.heading}>Learn Academy</Text>
                </View>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>CREATE AN ACCOUNT</Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Full Name"
          placeholderTextColor="#aaa"
        />

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          placeholderTextColor="#aaa"
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={role}
            onValueChange={(itemValue) => setRole(itemValue)}
            style={styles.picker}
            dropdownIconColor="#555"
          >
            <Picker.Item label="Select Role" value="" />
            <Picker.Item label="Student" value="student" />
            <Picker.Item label="Teacher" value="teacher" />
            <Picker.Item label="Admin" value="admin" />
          </Picker>
        </View>

        {(role === 'teacher' || role === 'admin') && (
          <TextInput
            style={styles.input}
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="Verification Code"
            placeholderTextColor="#aaa"
          />
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading || !(name && email && password && role)}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>REGISTER NOW</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
            Log in
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#013220',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: -30, 
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  formContainer: {
    flex: 1.3,
    backgroundColor: '#024b30',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 30,
    alignItems: 'center',
    overflow: 'hidden',  // Ensures the curved effect stays clean
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  picker: {
    height: 50,
    color: '#333',
  },
  button: {
    backgroundColor: '#00A651',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
  },
  link: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  logoContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  
});

