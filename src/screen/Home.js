import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import React, {useCallback, useContext, useState, useEffect} from 'react'
import { AuthContext } from './context/authContext'
import BottomTab from '../tabs/bottomTab'
import { PostContext } from './context/postContext'
import PostCard from '../PostCard'

const Home = () => {

    //Global State

    const [posts, getAllPosts] = useContext(PostContext)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {}, [getAllPosts]);

    //Refresh Control
    const onRefresh = useCallback(() => {
      setRefreshing(true);
      getAllPosts;
      setTimeout(() => {
        setRefreshing(false);
      }, 2000);
    }, []);

  return (
    <View style={styles.container}> 
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
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