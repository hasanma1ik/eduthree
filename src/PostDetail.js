import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import moment from 'moment';

const PostDetail = ({ route }) => {
  const { post } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: post?.postedBy?.profilePicture || 'https://via.placeholder.com/50' }}
          style={styles.profilePicture}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{post?.postedBy?.name}</Text>
          <Text style={styles.postDate}>{moment(post?.createdAt).format('DD MMM YYYY')}</Text>
        </View>
      </View>
      <View style={styles.descContainer}>
        <Text style={styles.desc}>{post?.description}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#006A4E',
    fontFamily: 'Kanit-Medium',
  },
  postDate: {
    fontSize: 14,
    color: 'gray',
  },
  descContainer: {
    padding: 20,
  },
  desc: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    fontFamily: 'Kanit-Medium',
  },
});

export default PostDetail;
