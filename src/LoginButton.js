import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

const LoginButton =({ btnTitle, loading, handleSubmit, textStyle}) =>{
    return (
        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{btnTitle}</Text>
      )}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
      backgroundColor: 'maroon',
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 10,
    },
    buttonText: {
      fontSize: 16,
      color: '#ffffff',
      // Add default button text styles here
    },
  });
  
  export default LoginButton;