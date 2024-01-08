import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React, {useState, useEffect} from 'react'
import BottomTab from '../tabs/bottomTab'
import axios from 'axios'
import PostCard from '../PostCard'

const MyPosts = () => {
//state
const [posts, setPosts] = useState([])
const [loading, setLoading] = useState(false)

// get user posts

const getUserPosts = async () =>{
    try {
        setLoading(true)
        const {data} = await axios.get('/post/get-user-post')
        setLoading(false)
        setPosts(data?.userPosts)
    } catch (error) {
        setLoading(false)
        console.log(error)
        alert(error)
    }
}

// initial 

useEffect(()=>{
getUserPosts()
}, [])



  return (
    <View style={styles.container}> 
    <ScrollView>
    <PostCard posts={posts} />
    <Text>{JSON.stringify(posts, null, 4)}</Text>
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
  

export default MyPosts