import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useContext } from 'react';
import BottomTab from '../tabs/bottomTab';
import { PostContext } from './context/postContext';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';

const Post = ({ navigation }) => {
  const [posts, setPosts] = useContext(PostContext);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  //handle form data post Data
  const handlePost = async () => {
    try {
      setLoading(true);
      if (!description) {
        alert('Please add post description');
        setLoading(false);
        return;
      }

      const { data } = await axios.post('/post/create-post', { description });
      setLoading(false);
      setPosts([...posts, data?.post]);
      alert(data?.message);
      navigation.navigate('Home');
    } catch (error) {
      alert(error.response.data.message || error.message);
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.headerContainer}>
         
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputBox}
            placeholder="Add post description"
            placeholderTextColor={'gray'}
            multiline={true}
            numberOfLines={5}
            value={description}
            onChangeText={(text) => setDescription(text)}
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.postBtn} onPress={handlePost}>
            <Text style={styles.postBtnText}>
              <FontAwesome5 name="plus-square" size={18} /> {'   '}
              Create Post
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
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
    marginTop: 40,
    backgroundColor: '#F5F5F5',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#228B22',
  },
  inputContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inputBox: {
    backgroundColor: '#ffffff',
    textAlignVertical: 'top',
    paddingTop: 10,
    width: '100%',
    fontSize: 16,
    paddingLeft: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  postBtn: {
    backgroundColor: '#04AA6D',
    paddingVertical: 15, // Increased vertical padding
    paddingHorizontal: 25, // Increased horizontal padding to make the button wider
    borderRadius: 2,
    width: 250, // Increased width
    marginHorizontal: 50, // Adjusted horizontal margin if needed
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  postBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Post;