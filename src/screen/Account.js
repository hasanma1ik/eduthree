import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import React, { useContext, useState } from 'react';
import { AuthContext } from './context/authContext';
import BottomTab from '../tabs/bottomTab';
import axios from 'axios';
import * as ImagePicker from 'react-native-image-picker';

const Account = () => {
  // Global State
  const [state, setState] = useContext(AuthContext);
  // Local state
  const { user, token } = state;
  const [name, setName] = useState(user?.name);
  const [password, setPassword] = useState(user?.password);
  const [email] = useState(user?.email);
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState(user?.profilePicture);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put('/auth/update-user', {
        name,
        password,
        email,
        profilePicture: imageUri,
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

  const selectImage = () => {
    ImagePicker.launchImageLibrary(
      { mediaType: 'photo', includeBase64: false },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else {
          const uri = response.assets[0].uri;
          setImageUri(uri);
        }
      },
    );
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
