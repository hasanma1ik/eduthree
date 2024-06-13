import React, { useCallback, useContext, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { PostContext } from './context/postContext';
import PostCard from '../PostCard';
import BottomTab from '../tabs/bottomTab';
import { useNavigation } from '@react-navigation/native';

const Home = () => {
  const [posts, , getAllPosts] = useContext(PostContext); // Note the deconstruction here
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getAllPosts().finally(() => {
      setRefreshing(false);
    });
  }, [getAllPosts]);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('PostDetail', { post: item })}>
      <PostCard post={item} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      <BottomTab />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Use theme colors
    padding: 10,
  },
});

export default Home;
