import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
import SearchableDropdown from 'react-native-searchable-dropdown';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import RNPickerSelect from 'react-native-picker-select';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';

const GradeSetter = () => {
  const [users, setUsers] = useState([]);
  const navigation = useNavigation();
  const [selectedUser, setSelectedUser] = useState({});
  const [grade, setGrade] = useState('');
  const grades = [
    'Grade 1',
    'Grade 2',
    'Grade 3',
    'Grade 4',
    'Grade 5',
    'Grade 6',
    'Grade 7',
    'Grade 8',
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/auth/all-users');
        const formattedUsers = response.data.users.map((user) => ({
          id: user._id,
          name: user.name,
        }));
        setUsers(formattedUsers);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch users');
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async () => {
    if (!selectedUser.id || !grade) {
      Alert.alert('Error', 'Please select both a user and a grade');
      return;
    }
    try {
      await axios.post('/auth/users/setGrade', { userId: selectedUser.id, grade });
      Alert.alert('Success', 'Grade updated successfully!');
    } catch (error) {
      console.error('Error setting grade:', error);
      Alert.alert('Error', 'Failed to set grade');
    }
  };
  

  const [fontsLoaded] = useFonts({
    'Ubuntu-Bold': require('../assets/fonts/Ubuntu-Bold.ttf'),
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
    {/* Custom Header */}
    <View style={styles.topHalf}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <FontAwesome5 name="arrow-left" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={styles.pageTitle}>Grade Setter</Text>
   
    </View>

    {/* Rest of the content */}
    <View style={styles.contentContainer}>
    <SearchableDropdown
        onItemSelect={(item) => setSelectedUser(item)}
        containerStyle={styles.searchableContainer}
        itemStyle={styles.dropdownItemStyle}
        itemTextStyle={styles.dropdownItemText}
        itemsContainerStyle={styles.itemsContainerStyle}
        items={users}
        resetValue={false}
        textInputProps={{
          placeholder: selectedUser.name || 'Select a user',
          placeholderTextColor: '#999',
          underlineColorAndroid: 'transparent',
          style: styles.searchableStyle,
        }}
        listProps={{
          nestedScrollEnabled: true,
        }}
      />

      {/* Grade Picker */}
      <View style={styles.inputContainer}>
        
        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={(value) => setGrade(value)}
            items={grades.map((g) => ({ label: g, value: g }))}
            placeholder={{ label: 'Select a grade', value: null }}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
            Icon={() => <Text style={styles.icon}>▼</Text>}
          />
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Assign</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Ubuntu-Bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchableContainer: {
    marginBottom: 20,
    padding: 10,
    marginTop: 100,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  dropdownItemStyle: {
    padding: 12,
    backgroundColor: '#FAFAFA',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 5,
  },
  dropdownItemText: {
    color: '#34495E',
    fontFamily: 'Ubuntu-Bold',
  },
  itemsContainerStyle: {
    maxHeight: 150,
    backgroundColor: '#FFFFFF',
  },
  searchableStyle: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFF',
    color: '#34495E',
    fontFamily: 'Ubuntu-Bold',
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
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
    marginTop: 10,
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 0,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  icon: {
    color: '#34495E',
    fontSize: 18,
    paddingRight: 10,
  },
  button: {
    backgroundColor: '#006446',
    borderRadius: 8,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Ubuntu-Bold',
    fontSize: 18,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    color: '#34495E',
    backgroundColor: '#FFFFFF',
    paddingRight: 30,
    fontFamily: 'Ubuntu-Bold',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    color: '#34495E',
    backgroundColor: '#FFFFFF',
    paddingRight: 30,
    fontFamily: 'Ubuntu-Bold',
  },
  placeholder: {
    color: '#999',
    fontFamily: 'Ubuntu-Bold',
  },
});

export default GradeSetter;
