import React,{createContext, useState, useEffect} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
//context
const AuthContext = createContext()

//provider
const AuthProvider = ({ children })=> {
    //global state
        const [state, setState] = useState({
            user:null,
            token: "",
        })
        //default axios setting
        axios.defaults.baseURL = 'http://192.168.109.115:8080/api/v1'
        // initial local storage data
        useEffect(()=>{
            const loadLocalStorageData = async () =>{
                    let data = await AsyncStorage.getItem('@auth')
                    let loginData = JSON.parse(data)
                    setState({...state, user:data?.user, token : data?.token}) 
            }
            loadLocalStorageData()
        }, [])
       
        return (
            <AuthContext.Provider value={[state, setState]}>
                {children}
              
            </AuthContext.Provider>
        )
}
export { AuthContext, AuthProvider}