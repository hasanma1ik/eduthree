import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import BottomTab from '../tabs/bottomTab';
import axios from 'axios';
import PostCard from '../PostCard';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const MyPosts = () => {
  // state
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // get user posts
  const getUserPosts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/post/get-user-post');
      setLoading(false);
      setPosts(data?.userPosts);
    } catch (error) {
      setLoading(false);
      console.log(error);
      alert(error);
    }
  };

  // initial
  useEffect(() => {
    getUserPosts();
  }, []);

  const [fontsLoaded] = useFonts({
    'BebasNeue': require('../../assets/fonts/BebasNeue-Regular.ttf'),
    'kanitregular': require('../../assets/fonts/Kanit-Regular.ttf'),
    'kanitmedium': require('../../assets/fonts/Kanit-Medium.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <View style={styles.header}>
      
        <Text style={styles.heading}>My Posts</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#00ff00" />
      ) : (
        <ScrollView>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} myPostScreen={true} />
          ))}
        </ScrollView>
      )}
      <View style={{ backgroundColor: '#ffffff' }}>
        <BottomTab />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  heading: {
    fontSize: 24,
    fontFamily: 'kanitmedium', // Use Kanit Regular font for the heading
    color: 'black',
    marginLeft: 10,
  },
  labelStyle: {
    fontFamily: 'kanitregular',
    fontSize: 14,
  },
});

export default MyPosts;
