import React, { useState } from 'react';
import { View, Button, StyleSheet, Alert, Text } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const CreateClasses = () => {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];
  const subjects = ['Math', 'Science', 'Islamiat', 'History', 'English Language', 'English Literature', 'Urdu'];

  const createGrade = async () => {
    if (selectedGrade === "") {
      Alert.alert("Validation Error", "Please select a grade");
      return;
    }
    try {
      await axios.post('/auth/grades', { grade: selectedGrade });
      Alert.alert("Success", "Grade created successfully");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to create grade");
    }
  };

  const createSubject = async () => {
    if (selectedSubject === "") {
      Alert.alert("Validation Error", "Please select a subject");
      return;
    }
    try {
      await axios.post('/auth/subjects', { name: selectedSubject });
      Alert.alert("Success", "Subject created successfully");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to create subject");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Grade</Text>
      <Picker
        selectedValue={selectedGrade}
        onValueChange={setSelectedGrade}
        style={styles.picker}>
        {grades.map((grade, index) => (
          <Picker.Item key={index} label={grade} value={grade} />
        ))}
      </Picker>
      <Button title="Create Grade" onPress={createGrade} />

      <Text style={styles.title}>Create Subject</Text>
      <Picker
        selectedValue={selectedSubject}
        onValueChange={setSelectedSubject}
        style={styles.picker}>
        {subjects.map((subject, index) => (
          <Picker.Item key={index} label={subject} value={subject} />
        ))}
      </Picker>
      <Button title="Create Subject" onPress={createSubject} />
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
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
});

export default CreateClasses;
