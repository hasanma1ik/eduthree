import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
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
    'Kanit-Medium': require('../../assets/fonts/Kanit-Medium.ttf'),
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
      {/* Header */}
      <View style={styles.header}>
        
        <TouchableOpacity onPress={getUserPosts}>
          <Ionicons name="refresh" size={20} color="#007BFF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <ScrollView style={styles.postList}>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} myPostScreen={true} />
          ))}
          {posts.length === 0 && (
            <Text style={styles.noPostsText}>No posts to display.</Text>
          )}
        </ScrollView>
      )}

      {/* Bottom Tab */}
      <View style={styles.bottomTabContainer}>
        <BottomTab />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9', // Light background
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Kanit-Medium',
    color: '#34495E', // Darker text for light background
  },
  postList: {
    marginBottom: 70, // Leave space for the bottom tab
  },
  noPostsText: {
    fontFamily: 'Kanit-Medium',
    fontSize: 16,
    color: '#7F8C8D', // Neutral gray for no posts message
    textAlign: 'center',
    marginTop: 20,
  },
  bottomTabContainer: {
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
});

export default MyPosts;
