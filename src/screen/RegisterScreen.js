import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator} from 'react-native';
import InputBox from '../InputBox';
import SubmitButton from '../SubmitButton';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';


const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(''); // Added state for role
  const [verificationCode, setVerificationCode] = useState(''); // Added state for verificationCode
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!name || !email || !password || !role) {
        Alert.alert('Please fill all fields');
        setLoading(false);
        return;
      }
      
      // Include role and verificationCode in the POST request
      const { data } = await axios.post('/auth/register', { name, email, password, role, verificationCode });

      Alert.alert(data && data.message);
      navigation.navigate('Login');
      console.log('Register Data==> ', { name, email, password, role, verificationCode });
      setLoading(false);
    } catch (error) {
      Alert.alert("Error", error.response.data.message);
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Register</Text>
      <View style={styles.inputContainer}>
        <InputBox inputTitle={"Name"} value={name} setValue={setName} />
        <InputBox inputTitle={"Email"} keyboardType="email-address" autoComplete="email" value={email} setValue={setEmail} />
        <InputBox inputTitle={"Password"} secureTextEntry={true} autoComplete="password" value={password} setValue={setPassword} />

        {/* Role Picker */}
        <Picker
          selectedValue={role}
          onValueChange={(itemValue, itemIndex) => setRole(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select Role" value="" />
          <Picker.Item label="Student" value="student" />
          <Picker.Item label="Teacher" value="teacher" />
          <Picker.Item label="Admin" value="admin" />
        </Picker>

        {/* Conditionally render verification code input for teachers */}
        {(role === 'teacher' || role === 'admin') && ( // Show for both teacher and admin roles
          <InputBox
            inputTitle="Verification Code"
            value={verificationCode}
            setValue={setVerificationCode}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login1")}>
        <Text style={styles.linkText}>
          Already Registered Please <Text style={styles.link}>LOGIN</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: "#1e2225",
    marginBottom: 20,
  },
  inputContainer: {
    marginHorizontal: 20,
  },
  picker: {
    height: 50,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  submitButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  linkText: {
    textAlign: "center",
    marginTop: 10,
  },
  link: {
    color: "#007BFF",
  }
});

export default RegisterScreen;
