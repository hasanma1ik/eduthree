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
               <Image source={require('./../assets/loginpic.png')} style={{width: 400, height: 400}} />

      <Text style={styles.loginText}>Welcome to my Educational App!</Text>
      <TouchableOpacity style={styles.button} onPress={onPress}>
            <FontAwesome name="google" size={24} color="white" style={{marginRight:10}} />
                <Text style={{color:Colors.BLACK}}>Sign In with Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onSignUp}>
        <Text style={{ color: Colors.BLACK }}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onLogin}>
      <Text style={styles.linkText}>Alread Registered Please {" "} <Text style ={styles.link}>LOGIN</Text></Text>
      </TouchableOpacity>
      
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
    loginText:{
      fontSize:35, fontWeight:'bold', textAlign: 'center'
  },
  button:{
    backgroundColor:Colors.PRIMARY,
    padding:10,
    margin:30,
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    borderRadius: 10
},
linkText:{
  textAlign: "center",
},
link: {
  color:'red',
}
  });