import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const GradeSetter = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [grade, setGrade] = useState('');
  const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/auth/all-users');
        setUsers(response.data.users);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch users');
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async () => {
    try {
      await axios.post('/auth/users/setGrade', { userId: selectedUserId, grade });
      Alert.alert('Success', 'Grade updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to set grade');
    }
  };

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedUserId}
        onValueChange={(itemValue) => setSelectedUserId(itemValue)}
      >
        <Picker.Item label="Select a user" value="" style={styles.picker} />
        {users.map((user) => (
          <Picker.Item key={user._id} label={user.name} value={user._id} style={styles.picker} />
        ))}
      </Picker>
      <Picker
        selectedValue={grade}
        onValueChange={(itemValue) => setGrade(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select a grade" value="" style={styles.picker} />
        {grades.map((g) => (
          <Picker.Item key={g} label={g} value={g} style={styles.picker} />
        ))}
      </Picker>
      <Button title="Set Grade" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  picker: {
    height: 150,
    width: 150,
    fontSize: 20,

   

  },
});

export default GradeSetter;

