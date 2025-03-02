import React, { useContext, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { AuthContext } from './context/authContext';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';

const Account = () => {
  const [state, setState] = useContext(AuthContext);
  const { user, token } = state;
  const navigation = useNavigation();

  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email] = useState(user?.email || '');
  const [country, setCountry] = useState(user?.country || 'Pakistan');
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState(user?.profilePicture || '');

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const timestamp = Date.now();
      const { data } = await axios.get(`/auth/profile?t=${timestamp}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setState((prev) => {
        if (JSON.stringify(prev.user) !== JSON.stringify(data.user)) {
          return { ...prev, user: data.user };
        }
        return prev;
      });

      setName(data.user.name || '');
      setImageUri(data.user.profilePicture || '');
      setCountry(data.user.country || 'Pakistan');
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      alert("Failed to fetch user profile");
    }
  };

  const updateProfilePicture = async (uri) => {
    try {
      setLoading(true);
      const { data } = await axios.put('/auth/update-user',
        { name, email, profilePicture: uri, country },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLoading(false);

      setState((prev) => {
        if (JSON.stringify(prev.user) !== JSON.stringify(data.updatedUser)) {
          return { ...prev, user: data.updatedUser };
        }
        return prev;
      });

      setImageUri(data.updatedUser.profilePicture);
      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error("Error updating profile picture:", error);
      setLoading(false);
      alert(error.response?.data?.message || error.message);
    }
  };

  const selectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!pickerResult.canceled) {
      const asset = pickerResult.assets[0];
      setImageUri(asset.uri);
      await updateProfilePicture(asset.uri);
    }
  };

  const handleUpdate = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.put('/auth/update-user',
        { name, password, email, profilePicture: imageUri, country },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLoading(false);

      setState((prev) => {
        if (JSON.stringify(prev.user) !== JSON.stringify(data.updatedUser)) {
          return { ...prev, user: data.updatedUser };
        }
        return prev;
      });

      alert('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  const handleLogOut = async () => {
    setState({ token: "", user: null });
    await AsyncStorage.removeItem("@auth");
    alert("Logged Out Successfully");
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.topHalf}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Account</Text>
        <TouchableOpacity style={styles.profileContainer} onPress={() => navigation.navigate('Account')}>
          <Image
            source={{ uri: imageUri || 'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={selectImage}>
            <Image
              source={{ uri: imageUri || 'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png' }}
              style={styles.profileImageLarge}
            />
          </TouchableOpacity>
          <Text style={styles.editText}>Tap to change picture</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.inputBox}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={[styles.inputBox, styles.disabledInput]}
            value={email}
            editable={false}
            placeholder="Email"
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Country</Text>
          <Picker
            selectedValue={country}
            onValueChange={(itemValue) => setCountry(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Pakistan" value="Pakistan" />
            <Picker.Item label="Saudi Arabia" value="Saudi Arabia" />
            <Picker.Item label="United Arab Emirates" value="United Arab Emirates" />
          </Picker>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.inputBox}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            placeholder="Enter new password (if changing)"
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <TextInput
            style={styles.inputBox}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            placeholder="Enter new password again"
            placeholderTextColor="#aaa"
          />
        </View>

        <TouchableOpacity
          style={[styles.updateBtn, loading && styles.disabledBtn]}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.updateBtnText}>Update Profile</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogOut}>
          <Icon name="sign-out-alt" size={20} color="white" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  scrollContainer: {
    alignItems: 'center',
    padding: 20,
  },
  /* Custom Header (same as StudentAssignments topHalf) */
  topHalf: {
    width: 393,
    height: 128,
    backgroundColor: '#006446',
    alignSelf: 'center',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 10,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 59,
    left: 10,
    padding: 10,
    zIndex: 1,
  },
  profileContainer: {
    position: 'absolute',
    top: 57,
    right: 10,
    padding: 5,
    zIndex: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  pageTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Ubuntu-Bold',
  },
  /* Larger Profile Image for the body */
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageLarge: {
    height: 120,
    width: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#018749',
  },
  editText: {
    marginTop: 10,
    fontSize: 14,
    color: '#018749',
    fontFamily: 'Kanit-Medium',
  },
  /* Input styles */
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Kanit-Medium',
    marginBottom: 5,
  },
  inputBox: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Kanit-Medium',
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    borderColor: '#EEE',
  },
  picker: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Kanit-Medium',
    color: '#333',
  },
  updateBtn: {
    width: '100%',
    backgroundColor: '#018749',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledBtn: {
    backgroundColor: '#A9A9A9',
  },
  updateBtnText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D7263D',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 30,
  },
  logoutText: {
    fontFamily: 'Kanit-Medium',
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
  },
});

export default Account;
