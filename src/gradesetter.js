import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Alert, Text } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import SearchableDropdown from 'react-native-searchable-dropdown';

const GradeSetter = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState({}); // Use an object to keep track of the selected user
  const [grade, setGrade] = useState('');
  const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/auth/all-users');
        // Map users to format expected by SearchableDropdown
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set User Grade</Text>
      <SearchableDropdown
        onItemSelect={(item) => setSelectedUser(item)}
        containerStyle={styles.searchableContainer}
        itemStyle={styles.dropdownItemStyle}
        itemTextStyle={styles.dropdownItemText}
        itemsContainerStyle={styles.itemsContainerStyle}
        items={users}
        defaultIndex={2}
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
      <View style={styles.buttonContainer}>
        <Button title="Set Grade" onPress={handleSubmit} color="#007BFF" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF', // Lighter background for a cleaner look
  },
  title: {
    fontSize: 26, // Slightly larger for emphasis
    fontWeight: 'bold',
    color: '#1A1A2E', // Darker color for contrast
    marginBottom: 30, // Increased spacing
    textAlign: 'center',
  },
  picker: {
    marginBottom: 25,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerItem: {
    fontSize: 18,
  },
  buttonContainer: {
    marginTop: 20,
    borderRadius: 8,
  },
  searchableContainer: {
    marginBottom: 20,
    padding: 5,
  },
  dropdownItemStyle: {
    padding: 10,
    backgroundColor: '#FAFAFA',
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 5,
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
    borderColor: '#DDD',
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
});

export default GradeSetter;
