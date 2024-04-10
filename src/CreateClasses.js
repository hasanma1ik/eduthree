import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Alert, Text, ScrollView } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment-timezone'; // Import moment-timezone


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
 const timeSlots = ['10:05 AM - 11:05 AM','8:00 AM - 9:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '12:00 PM - 1:00 PM', '9:00 PM - 10:00 PM', '11:23 PM - 12:23 AM' ];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

// This function looks correct for converting UTC times back to the user's local time for display
const displayLocalTimeSlot = (utcTimeSlot) => {
  const [startTime, endTime] = utcTimeSlot.split(' - ');
  const format = 'h:mm A';
  const localStartTime = moment.utc(startTime, 'HH:mm').local().format(format);
  const localEndTime = moment.utc(endTime, 'HH:mm').local().format(format);
  return `${localStartTime} - ${localEndTime}`;
};


const createGrade = async () => {
  if (selectedGrade === "" || selectedSubject === "" || selectedTimeSlot === "" || selectedDay === "" || selectedTeacher === "") {
      Alert.alert("Validation Error", "Please fill all fields");
      return;

      
  }
  const [startTime, endTime] = selectedTimeSlot.split(' - ');
  const format = 'h:mm A';
  const utcStartTime = moment.tz(startTime, format, moment.tz.guess()).utc().format(format);
  const utcEndTime = moment.tz(endTime, format, moment.tz.guess()).utc().format(format);
  const utcTimeSlot = `${utcStartTime} - ${utcEndTime}`;

  const postData = {
    grade: selectedGrade,
    subject: selectedSubject,
    timeSlot: utcTimeSlot,
    day: selectedDay,
    teacher: selectedTeacher,
    term: selectedTerm,
  };

 
  
  // Utility function to convert UTC time slots to local timezone
 

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
      {selectedTimeSlot && (
  <Text>{displayLocalTimeSlot(selectedTimeSlot)}</Text>
)}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#E8E8E8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
    textAlign: 'center',
  },
  currentDateTime: {
    fontSize: 16,
    textAlign: 'center',
    margin: 12,
    color: '#555',
  },
});




export default CreateClasses;
