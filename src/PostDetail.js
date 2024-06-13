import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import moment from 'moment';

const PostDetail = ({ route }) => {
  const { post } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: post?.postedBy?.profilePicture || 'https://via.placeholder.com/50' }} style={styles.profilePicture} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{post?.postedBy?.name}</Text>
          <Text style={styles.postDate}>{moment(post?.createdAt).format('DD:MM:YYYY')}</Text>
        </View>
      </View>
      <Text style={styles.desc}>{post?.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userInfo: {
    flexDirection: 'column',
  },
  userName: {
    fontWeight: 'bold',
    color: '#2ecc71',
    fontSize: 16,
  },
  postDate: {
    color: 'gray',
    fontSize: 12,
  },
  desc: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
    backgroundColor: '#e6ffe6',
    padding: 10,
    borderRadius: 10,
  },
});

export default PostDetail;
