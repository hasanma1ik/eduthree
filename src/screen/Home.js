import { View, Text, StyleSheet } from 'react-native'
import React, {useContext} from 'react'
import { AuthContext } from './context/authContext'
import BottomTab from '../tabs/bottomTab'

const Home = () => {

    //Global State
    const [state] = useContext(AuthContext)

  return (
    <View style={styles.container}> 
      
      <Text>{JSON.stringify(state, null, 4)}</Text>
      <BottomTab/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    margin:10,
    justifyContent:'space-between',
  
  },
})

export default Home