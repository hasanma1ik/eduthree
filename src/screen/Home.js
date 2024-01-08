import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React, {useContext} from 'react'
import { AuthContext } from './context/authContext'
import BottomTab from '../tabs/bottomTab'
import { PostContext } from './context/postContext'
import PostCard from '../PostCard'

const Home = () => {

    //Global State

    const [posts] = useContext(PostContext)
  return (
    <View style={styles.container}> 
      <ScrollView>
        <PostCard posts={posts}/>

      {/* <Text>{JSON.stringify(posts, null, 4)}</Text> */}
      </ScrollView>
      <View style={{backgroundColor: '#ffffff'}}>
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

export default Home