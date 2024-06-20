import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import SearchableDropdown from 'react-native-searchable-dropdown';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

const GradeSetter = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});
  const [grade, setGrade] = useState('');
  const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];

 

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/auth/all-users');
        const formattedUsers = response.data.users.map(user => ({
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
      Alert.alert('Error', 'Failed to set grade');
    }
  };

  const [fontsLoaded] = useFonts({
    'kanitmedium': require('../assets/fonts/Kanit-Medium.ttf'),
  });

  const onLayoutRootView = React.useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.outerContainer} onLayout={onLayoutRootView}>
      <Text style={styles.title}>Set User Grade</Text>
      <View style={styles.container}>
        <SearchableDropdown
          onItemSelect={(item) => setSelectedUser(item)}
          containerStyle={styles.searchableContainer}
          itemStyle={styles.dropdownItemStyle}
          itemTextStyle={styles.dropdownItemText}
          itemsContainerStyle={styles.itemsContainerStyle}
          items={users}
          resetValue={false}
          textInputProps={{
            placeholder: selectedUser.name || "Select a user",
            underlineColorAndroid: "transparent",
            style: styles.searchableStyle,
          }}
          listProps={{
            nestedScrollEnabled: true,
          }}
        />
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={grade}
            onValueChange={(itemValue) => setGrade(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select a grade" value="" />
            {grades.map((g) => (
              <Picker.Item key={g} label={g} value={g} />
            ))}
          </Picker>
        </View>
        <TouchableOpacity style={[styles.button, styles.blackButton]} onPress={handleSubmit}>
          <Text style={[styles.buttonText, styles.buttonTextLarge]}>Set Grade</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Light background for a clean look
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'kanitmedium', // Use Kanit Medium font for the heading
    color: 'black',
    marginBottom: 10,
    marginLeft: 10,
    position: 'absolute',
    top: 10,
    left: 10,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 25,
    overflow: 'hidden',
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow for iOS
    shadowOpacity: 0.2, // Shadow for iOS
    shadowRadius: 3, // Shadow for iOS
  },
  picker: {
    width: '100%',
  },
  buttonContainer: {
    marginTop: 20,
    borderRadius: 8,
  },
  searchableContainer: {
    marginBottom: 20,
    padding: 5,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow for iOS
    shadowOpacity: 0.2, // Shadow for iOS
    shadowRadius: 3, // Shadow for iOS
  },
  dropdownItemStyle: {
    padding: 10,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 5,
  },
  dropdownItemText: {
    color: '#333',
  },
  itemsContainerStyle: {
    maxHeight: 140,
  },
  searchableStyle: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow for iOS
    shadowOpacity: 0.2, // Shadow for iOS
    shadowRadius: 3, // Shadow for iOS
  },
  blackButton: {
    backgroundColor: 'black',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonTextLarge: {
    fontSize: 18, // Larger font size for the button text
  },
});

export default GradeSetter;
