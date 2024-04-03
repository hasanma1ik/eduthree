import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Alert, Text, ScrollView } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const CreateClasses = () => {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  const [terms, setTerms] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [teachers, setTeachers] = useState([]);
  const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'];
  const subjects = ['Math', 'Science', 'Islamiat', 'History', 'English Language', 'English Literature', 'Urdu'];
  const timeSlots = ['8:00 AM - 9:00 AM', '9:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '12:00 PM - 1:00 PM'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    // Fetch teachers from the backend when the component mounts
    fetchTeachers();
    fetchTerms();
  }, []);

 const fetchTeachers = async () => {
  try {
    const response = await axios.get('/auth/teachers');
    console.log(response.data); // Log to see the actual structure
    setTeachers(response.data.teachers); // Make sure this matches the logged structure
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Failed to fetch teachers");
  }
};

const fetchTerms = async () => {
  try {
    const response = await axios.get('/auth/terms');
    setTerms(response.data.terms);
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Failed to fetch terms");
  }
};

const createGrade = async () => {
  if (selectedGrade === "" || selectedSubject === "" || selectedTimeSlot === "" || selectedDay === "" || selectedTeacher === "") {
      Alert.alert("Validation Error", "Please fill all fields");
      return;
  }

 

  const postData = {
      grade: selectedGrade,
      subject: selectedSubject,
      timeSlot: selectedTimeSlot,
      day: selectedDay,
      teacher: selectedTeacher,
      term: selectedTerm
      
  };

  try {
      const response = await axios.post('/auth/grades', postData);
      Alert.alert("Success", "Class created successfully");
  } catch (error) {
      // Display the custom error message from the backend
      const errorMessage = error.response?.data?.message || "An unexpected error occurred";
      Alert.alert("Error", errorMessage);
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Class</Text>
      <Picker
        selectedValue={selectedGrade}
        onValueChange={setSelectedGrade}
        style={styles.picker}
      >
        <Picker.Item label="Select Grade" value="" />
        {grades.map((grade, index) => (
          <Picker.Item key={index} label={grade} value={grade} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedSubject}
        onValueChange={setSelectedSubject}
        style={styles.picker}
      >
        <Picker.Item label="Select Subject" value="" />
        {subjects.map((subject, index) => (
          <Picker.Item key={index} label={subject} value={subject} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedTimeSlot}
        onValueChange={setSelectedTimeSlot}
        style={styles.picker}
      >
        <Picker.Item label="Select Time Slot" value="" />
        {timeSlots.map((slot, index) => (
          <Picker.Item key={index} label={slot} value={slot} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedDay}
        onValueChange={setSelectedDay}
        style={styles.picker}
      >
        <Picker.Item label="Select Day" value="" />
        {days.map((day, index) => (
          <Picker.Item key={index} label={day} value={day} />
        ))}
      </Picker>

      <Picker
  selectedValue={selectedTeacher}
  onValueChange={setSelectedTeacher}
  style={styles.picker}
>
  <Picker.Item label="Select Teacher" value="" />
  {teachers.map((teacher, index) => (
    <Picker.Item key={index} label={teacher.name} value={teacher._id} /> // Use teacher._id
  ))}
</Picker>

<Picker
        selectedValue={selectedTerm}
        onValueChange={setSelectedTerm}
        style={styles.picker}
      >
        <Picker.Item label="Select Term" value="" />
        {terms.map((term, index) => (
          <Picker.Item key={index} label={term.name} value={term._id} />
        ))}
      </Picker>

      <Button title="Create Class" onPress={createGrade} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  picker: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default CreateClasses;
