import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import moment from 'moment';
import axios from 'axios';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "./screen/context/authContext";


const PostCard = ({ post, myPostScreen }) => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [state] = useContext(AuthContext);
  const { user } = state;

  const handleDeletePrompt = (id) => {
    Alert.alert(
      "Attention!",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => handleDeletePost(id) }
      ]
    );
  };

  const handleDeletePost = async (id) => {
    try {
      setLoading(true);
      const { data } = await axios.delete(`/post/delete-post/${id}`);
      setLoading(false);
      alert(data?.message);
      navigation.push('Home');
    } catch (error) {
      setLoading(false);
      console.log(error);
      alert(error);
    }
  };

  const canDelete = () => {
    if (user.role === 'admin') return true;
    if (user.role === 'teacher' && post?.postedBy?._id === user._id) return true;
    return false;
  };

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Image
          source={{ uri: post?.postedBy?.profilePicture || 'https://blog-uploads.imgix.net/2021/08/what-is-sample-size-Sonarworks-blog.jpg?auto=compress%2Cformat' }}
          style={styles.profilePicture}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{post?.postedBy?.name}</Text>
          <Text style={styles.postDate}>{moment(post?.createdAt).format('DD:MM:YYYY')}</Text>
          <Text style={styles.desc}>{post?.description}</Text>
        </View>
        {(canDelete() || myPostScreen) && (
          <TouchableOpacity onPress={() => handleDeletePrompt(post?._id)}>
            <FontAwesome5 name="trash" size={16} color={"red"} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 0,
  },
  content: {
    flexDirection: 'row',
  },
  profilePicture: {
    width: 70,
    height: 100,
    borderRadius: 15,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontWeight: 'bold',
    color: '#228B22',
    fontSize: 16,
    marginBottom: 5,
  },
  postDate: {
    color: 'gray',
    fontSize: 12,
    marginBottom: 5,
  },
  desc: {
    fontSize: 14,
    color: '#333',
  },
});

export default PostCard;
