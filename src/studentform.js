import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Alert} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';


const StudentForm = () => {
  const [grades, setGrades] = useState(['Grade 1', 'Grade 2', 'Grade 3']); // Example grades
  const [subjects, setSubjects] = useState([]); // Subjects will be fetched from the backend
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      fetchStudentsByGrade(selectedGrade);
    }
  }, [selectedGrade]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/auth/subjects');
      setSubjects(response.data.subjects);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch subjects");
    }
  };

  const fetchStudentsByGrade = async (grade) => {
    try {
      const response = await axios.get(`/auth/users/grade/${grade}`);
      setStudents(response.data.users);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch students");
    }
  };

  const registerStudentForSubject = async (userId) => {
    try {
      await axios.post('/auth/users/registerSubject', { userId, subjectId: selectedSubject });
      Alert.alert("Success", "Student registered for subject successfully");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to register student for subject");
    }
  };

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedGrade}
        onValueChange={(itemValue) => setSelectedGrade(itemValue)}>
        {grades.map((grade) => <Picker.Item label={grade} value={grade} key={grade} />)}
      </Picker>

      <Picker
        selectedValue={selectedSubject}
        onValueChange={(itemValue) => setSelectedSubject(itemValue)}>
        {subjects.map((subject) => <Picker.Item label={subject.name} value={subject._id} key={subject._id} />)}
      </Picker>

      {students.map((student) => (
        <View key={student._id}>
          <Button title={`Register ${student.name} for Selected Subject`} onPress={() => registerStudentForSubject(student._id)} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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


 