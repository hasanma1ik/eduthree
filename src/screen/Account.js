// src/screen/Account.js
import React, { useContext, useState, useEffect, useCallback } from 'react';
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

const FormData = global.FormData;

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

  // Enrollment display state
  const [termInfo, setTermInfo] = useState(null); // { _id, name, startDate, endDate } or null

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  useEffect(() => {
    // When profile changes, decide if we need to fetch term details
    const maybeLoadTerm = async () => {
      const u = state?.user;
      if (!u?.term) {
        setTermInfo(null);
        return;
      }
      // If backend already populated term as an object with name/dates, use it
      if (typeof u.term === 'object' && (u.term.name || u.term.startDate || u.term.endDate)) {
        setTermInfo(u.term);
        return;
      }
      // Else if it's an ID, fetch term details
      if (typeof u.term === 'string') {
        try {
          const res = await axios.get(`/auth/terms/${u.term}`);
          if (res.data?.term) setTermInfo(res.data.term);
          else setTermInfo(null);
        } catch (e) {
          // Non-blocking: just don't show term if fetch fails
          setTermInfo(null);
        }
      }
    };
    maybeLoadTerm();
  }, [state?.user]);

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

  // ---- Enrollment display helpers ----
  const deriveGradeText = () => {
    // Prefer explicit gradeLevel + section
    const gradeLevel = user?.gradeLevel;
    const section = user?.section;
    if (gradeLevel && section) return `${gradeLevel} - ${section}`;
    if (gradeLevel) return gradeLevel;
    // Fallback to legacy combined grade
    return user?.grade || '—';
  };

  const deriveSectionText = () => {
    if (user?.section) return user.section;
    // Try to parse from legacy "Grade X - Y"
    if (user?.grade && user.grade.includes('-')) {
      const parts = user.grade.split('-').map(s => s.trim());
      if (parts.length === 2) return parts[1]; // section letter
    }
    return '—';
  };

  // Format YYYY-MM-DD from a Date or ISO string
  const fmt = (d) => {
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return null;
      return dt.toISOString().slice(0, 10);
    } catch {
      return null;
    }
  };

  const termName = termInfo?.name || null;
  const startISO = termInfo?.startDate;
  const endISO = termInfo?.endDate;
  const startStr = startISO ? fmt(startISO) : null;
  const endStr = endISO ? fmt(endISO) : null;
  const dateRange = startStr && endStr ? `${startStr} - ${endStr}` : (startStr || endStr || null);

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.topHalf}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Account</Text>

        {/* Logout icon in top right */}
        <TouchableOpacity style={styles.logoutIcon} onPress={handleLogOut}>
          <Icon name="sign-out-alt" size={24} color="#FFFFFF" />
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

        {/* Enrollment Card (visible for students or anyone who has these fields) */}
        {(user?.grade || user?.gradeLevel || user?.section || user?.term) && (
          <View style={styles.enrollmentCard}>
            <Text style={styles.enrollmentTitle}>Enrollment</Text>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Grade</Text>
              <Text style={styles.rowValue}>{deriveGradeText()}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Section</Text>
              <Text style={styles.rowValue}>{deriveSectionText()}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Batch / Term</Text>
              <View style={styles.termRightCol}>
                <Text style={styles.batchName}>{termName || '—'}</Text>
                {dateRange ? <Text style={styles.batchDates}>{dateRange}</Text> : null}
              </View>
            </View>
          </View>
        )}

        {/* Editable profile fields */}
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
            <Text style={styles.updateBtnText}>UPDATE PROFILE</Text>
          )}
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
    padding: 20,
  },
  /* Custom Header */
  topHalf: {
    width: '100%',
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
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Ubuntu-Bold',
  },
  /* Profile Image in Body */
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageLarge: {
    height: 120,
    width: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#006446',
    marginBottom: 10,
  },
  editText: {
    marginTop: 10,
    fontSize: 14,
    color: '#006446',
    fontFamily: 'Ubuntu-Bold',
  },

  /* Enrollment Card */
  enrollmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6E8EB',
  },
  enrollmentTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 16,
    color: '#006446',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 6,
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontFamily: 'Ubuntu-Bold',
    color: '#444',
  },
  rowValue: {
    fontFamily: 'Ubuntu-Bold',
    color: '#111',
  },
  termRightCol: {
    alignItems: 'flex-end',
    maxWidth: '65%',
  },
  batchName: {
    fontSize: 14,
    color: '#111',
    fontFamily: 'Ubuntu-Bold',
  },
  batchDates: {
    marginTop: 2,
    fontSize: 12,
    color: '#666',
    fontFamily: 'Ubuntu-Bold',
  },

  /* Input Styles */
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 5,
  },
  inputBox: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Ubuntu-Bold',
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
    fontFamily: 'Ubuntu-Bold',
    color: '#333',
  },
  updateBtn: {
    width: '85%',
    backgroundColor: '#00E678',
    paddingVertical: 22,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 14,
  },
  logoutIcon: {
    position: 'absolute',
    top: 57,
    right: 10,
    padding: 10,
    zIndex: 1,
  },
  disabledBtn: {
    backgroundColor: '#A9A9A9',
  },
  updateBtnText: {
    color: '#000',
    fontSize: 24,
    fontFamily: 'Ubuntu-Bold',
    textTransform: 'uppercase',
  },
  /* Logout Button (kept for reference/consistency) */
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D7263D',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    margin: 20,
  },
  logoutText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
  },
});

export default Account;
