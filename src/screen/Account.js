import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from './context/authContext';
import BottomTab from '../tabs/bottomTab';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Account = () => {
  // Global State
  const [state, setState] = useContext(AuthContext);
  // Local state
  const { user, token } = state;
  const [name, setName] = useState(user?.name);
  const [password, setPassword] = useState('');
  const [email] = useState(user?.email);
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState(user?.profilePicture);

  useEffect(()=> {
    setImageUri(user?.profilePicture)}, [user]);




  const updateProfilePicture = async (uri) => {
    try {
      setLoading(true);
      const { data } = await axios.put('/auth/update-user', {
        name,
        email,
        profilePicture: uri,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoading(false);
      setState({ ...state, user: data.updatedUser });
      
    } catch (error) {
      console.log("Error updating profile picture:", error);
      setLoading(false);
      alert(error.response.data.message || error.message);
    }
  };

  const selectImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      const asset = pickerResult.assets[0];
      setImageUri(asset.uri);
      await updateProfilePicture(asset.uri);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put('/auth/update-user', {
        name,
        password,
        email,
        profilePicture: imageUri,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoading(false);
      setState({ ...state, user: data.updatedUser });
      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity onPress={selectImage}>
            <Image
              source={{
                uri: imageUri || 'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png',
              }}
              style={{ height: 200, width: 200, borderRadius: 100 }}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.warningText}>Currently, you can only update your name and password</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Name</Text>
          <TextInput style={styles.inputBox} value={name} onChangeText={(text) => setName(text)} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Email</Text>
          <TextInput style={styles.inputBox} value={email} editable={false} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Password</Text>
          <TextInput
            style={styles.inputBox}
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
            placeholder="Enter new password (if changing)"
          />
        </View>

        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate}>
            <Text style={styles.updateBtnText}>{loading ? 'Please Wait' : 'Update Profile'}</Text>
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
  },
  warningText: {
    color: 'red',
    fontSize: 13,
    textAlign: 'center',
  },
  inputContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputText: {
    fontWeight: 'bold',
    width: 70,
    color: 'gray',
  },
  inputBox: {
    width: 250,
    backgroundColor: '#ffffff',
    marginLeft: 10,
    fontSize: 16,
    paddingLeft: 20,
    borderRadius: 5,
  },
  updateBtn: {
    backgroundColor: '#04AA6D',
    height: 40,
    width: 250,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateBtnText: {
    color: '#ffffff',
    fontSize: 18,
  },
});

export default Account;
