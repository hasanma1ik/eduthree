import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState } from 'react'
import InputBox from '../InputBox'
import SubmitButton from '../SubmitButton'
import axios from 'axios'


const RegisterScreen = ({navigation}) =>{
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if(!name || !email || !password){
      Alert.alert('Please fill all fields')
       setLoading(false)
       return;
      };
      setLoading(false)

      const {data} = await axios.post('/auth/register',{name, email, password});

      alert(data && data.message)
      navigation.navigate('Login');
      console.log('Register Data==> ' ,{name, email, password})
    } catch (error){
      alert(error.response.data.message);
      setLoading(false)
      console.log(error)
    }
  }
  
  return (
   
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Register</Text>
      <View style={ styles.inputContainer }>
      <InputBox inputTitle={"Name"} value={name} setValue={setName}/>
      <InputBox inputTitle={"Email"} keyboardType="email-address" autoComplete="email" value={email} setValue={setEmail}/>
      <InputBox inputTitle={"Password"} secureTextEntry={true} autoComplete="password" value={password} setValue={setPassword}/>

      </View>
      {/* <Text>{JSON.stringify({ name, email, password }, null, 4)}</Text> */}

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

     <TouchableOpacity onPress={()=> navigation.navigate("Login1")}>
      <Text style={styles.linkText}>
        Already Registered Please <Text style={styles.link}>LOGIN</Text>
      </Text>
     </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    pageTitle:{
      fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: "#1e2225",
        marginBottom: 20,
    },
    inputContainer: {
      marginHorizontal: 20,
    },

    submitButton:{
      backgroundColor: '#007bff',
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 10,
      marginHorizontal: 20,
    },

    submitButtonText:{
      fontSize:18,
      color: '#ffffff',
      fontWeight: 'bold',
    },
    linkText:{
      textAlign: "center",
      marginTop: 10,
    },
    link: {
      color: "#007BFF",
      color: "#007BFF",
    }
})
export default RegisterScreen