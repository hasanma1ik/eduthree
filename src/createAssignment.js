import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const CreateAssignment = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleCreate = async () => {
    try {
      const response = await axios.post('/auth/create-assignments', {
        title,
        description,
        dueDate
      });
      Alert.alert("Success", "Assignment created successfully");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to create assignment");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />
      <TextInput placeholder="Due Date (YYYY-MM-DD)" value={dueDate} onChangeText={setDueDate} style={styles.input} />
      <Button title="Create Assignment" onPress={handleCreate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { marginBottom: 20, borderWidth: 1, borderColor: '#cccccc', padding: 10 },
});

export default CreateAssignment;
