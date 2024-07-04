import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import * as WebBrowser from "expo-web-browser";
import React from 'react'
import { FontAwesome } from '@expo/vector-icons';
import Colors from './Colors';
import { useOAuth } from '@clerk/clerk-expo'
import { useWarmUpBrowser } from '../hooks/warmUpBrowser';
import { useNavigation } from '@react-navigation/native';

WebBrowser.maybeCompleteAuthSession();

export default function LoginPage(){
    useWarmUpBrowser();
    const navigation = useNavigation();
 
    const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
    
    const onPress= async()=>{
        try {
            const { createdSessionId, signIn, signUp, setActive } =
              await startOAuthFlow();
       
            if (createdSessionId) {
              setActive({ session: createdSessionId });
            } else {
              // Use signIn or signUp for next steps such as MFA
            }
          } catch (err) {
            console.error("OAuth error", err);
          }
    }
    const onSignUp = () => {
      // Navigate to the RegisterScreen
      navigation.navigate('Register');
    };
    const onLogin = () =>{
      navigation.navigate('Login1')
    }

    return (
        <View style={styles.container}>
          <Text style={styles.loginText}>Learn Academy</Text>
               <Image source={require('./../assets/loginpic.png')} style={{width: 400, height: 400}} />

      

      <TouchableOpacity style={styles.button1} onPress={onLogin}>
      <Text style={styles.linkText1}> <Text style ={styles.link1}>LOGIN</Text></Text>
      </TouchableOpacity>
      <Text style={styles.orStyle}>or</Text>
      <TouchableOpacity style={styles.button2} onPress={onPress}>
            <FontAwesome name="google" size={24} color="white" style={{marginRight:10}} />
                <Text style={styles.linkText2}><Text style ={styles.link1}>Sign in with Google</Text></Text>
            </TouchableOpacity>

            {/* <TouchableOpacity style={styles.button} onPress={onSignUp}>
        <Text style={{ color: Colors.BLACK }}>Sign Up</Text>
      </TouchableOpacity> */}
   
      
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
   
  button1:{
    backgroundColor:'#2B2D2F',
    padding:10,
    margin:30,
    width: 200,
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    borderRadius: 10
},
button2:{
  backgroundColor:'#2B2D2F',
  padding:10,
  margin:30,
  width: 200,
  display:'flex',
  flexDirection:'row',
  justifyContent:'center',
  alignItems:'center',
  borderRadius: 10
},

loginText:{
  
  fontSize:30,
  textAlign: "center",
  fontFamily: 'outfit-bold',
},

linkText1:{
  textAlign: "center",
  fontFamily: 'outfit-medium'
},
linkText2:{
  textAlign: "center",
  fontFamily: 'outfit-medium'
},


link1: {
  color:'white',
},
orStyle:{
  fontFamily: 'outfit-bold',
  marginBottom:-10,
  marginTop: -10,

}

  });