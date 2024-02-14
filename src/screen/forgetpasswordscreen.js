import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const ForgetPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleForgetPassword = async () => {
    if (email) {
      try {
        // API call to backend to send reset password email
        await axios.post('/auth/request-password-reset', { email });
        Alert.alert(
          "Reset Link Sent",
          "If the email you entered is associated with an account, you will receive an email with instructions to reset your password.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } catch (error) {
        Alert.alert("Error", "Failed to send reset link. Please try again.");
      }
    } else {
      Alert.alert("Error", "Please enter your email address.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={setEmail}
        value={email}
        placeholder="Enter your email"
        keyboardType="email-address"
      />
      <Button title="Send Reset Link" onPress={handleForgetPassword}  />
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 20,
  },
});

export default ForgetPasswordScreen;
