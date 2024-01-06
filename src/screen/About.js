import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import BottomTab from '../tabs/bottomTab'

const About = () => {
    
    return (
        <View style={styles.container}> 
          <View style={{flex: 1, justifyContent: "flex-end"}}>
          <BottomTab/>
          </View>
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
      

export default About