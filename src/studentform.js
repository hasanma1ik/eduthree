import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Alert, Text, ScrollView } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const StudentForm = () => {
  const [grades, setGrades] = useState(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8']);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      fetchUsersByGrade(selectedGrade);
    }
  }, [selectedGrade]);

  const fetchUsersByGrade = async (grade) => {
    try {
      const response = await axios.get(`/auth/class/grade/${grade}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error(`Failed to fetch users for grade ${grade}:`, error);
      Alert.alert("Error", `Failed to fetch users for grade ${grade}`);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/auth/subjects');
      setSubjects(response.data.subjects);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      Alert.alert("Error", "Failed to fetch subjects");
    }
  };

  const registerUserForSubject = async (userId) => {
    try {
      await axios.post('/auth/users/registerSubject', { userId, subjectId: selectedSubject });
      Alert.alert("Success", "User registered for subject successfully");
    } catch (error) {
      console.error(`Failed to register user ${userId} for subject ${selectedSubject}:`, error);
      Alert.alert("Error", `Failed to register user for subject`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.headerText}>Select a Grade:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedGrade}
            onValueChange={itemValue => setSelectedGrade(itemValue)}
            style={styles.picker}>
            <Picker.Item label="Select a grade" value="" />
            {grades.map(grade => <Picker.Item key={grade} label={grade} value={grade} />)}
          </Picker>
        </View>

        <Text style={styles.headerText}>Select a Subject:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedSubject}
            onValueChange={itemValue => setSelectedSubject(itemValue)}
            style={styles.picker}>
            <Picker.Item label="Select a subject" value="" />
            {subjects.map(subject => <Picker.Item key={subject._id} label={subject.name} value={subject._id} />)}
          </Picker>
        </View>

        {users.map(user => (
          <View key={user._id} style={styles.userContainer}>
            <Text style={styles.userName}>{user.name}</Text>
            <Button title="Enroll" onPress={() => registerUserForSubject(user._id)} color="#4CAF50" />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10, // Reduce padding to move content up
  },
  scrollView: {
    alignItems: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 18,
    marginBottom: 20,
    width: '90%',
   
  },
  picker: {
    width: '100%',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  userContainer: {
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    width: '90%',
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userName: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default StudentForm;





  // Function to handle form submission
  // const handleSubmit = async () => {
  //   try {
      // await axios.post('/auth/students/addOrUpdate', {
  //       name,
  //       email,
  //       classId: selectedClassId,
  //        selectedSubjects,
  //     });
  //     alert('Student added/updated successfully!');
  //     // Reset form or navigate away
  //   } catch (error) {
  //     console.error('Failed to add/update student:', error);
  //     alert('Failed to add/update student');
  //   }
  // };


 