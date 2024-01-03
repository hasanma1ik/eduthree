import { View, Text, TextInput, StyleSheet, Alert } from 'react-native'
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
      <Text style={styles.pageTitle}>RegisterScreen</Text>
      <View style={{ marginHorizontal:20 }}>
      <InputBox inputTitle={"Name"} value={name} setValue={setName}/>
      <InputBox inputTitle={"Email"} keyboardType="email-address" autoComplete="email" value={email} setValue={setEmail}/>
      <InputBox inputTitle={"Password"} secureTextEntry={true} autoComplete="password" value={password} setValue={setPassword}/>

      </View>
      {/* <Text>{JSON.stringify({ name, email, password }, null, 4)}</Text> */}
      <SubmitButton btnTitle="Register" loading={loading} handleSubmit={handleSubmit} />
      <Text style={styles.linkText}>Alread Registered Please {" "} <Text style ={styles.link} onPress={()=>navigation.navigate("Login1")}>LOGIN</Text></Text>


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
    linkText:{
      textAlign: "center",
    },
    link: {
      color:'red',
    }
})
export default RegisterScreen