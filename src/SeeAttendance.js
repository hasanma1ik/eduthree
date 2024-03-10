import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const SeeAttendance = () => {
  const [grades, setGrades] = useState(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8']);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedGrade && selectedSubject) {
      fetchAttendanceDates();
    }
  }, [selectedGrade, selectedSubject]);

  useEffect(() => {
    if (selectedDate) {
      fetchAttendanceData();
    }
  }, [selectedDate]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/auth/subjects');
      setSubjects(response.data.subjects);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      Alert.alert("Error", "Failed to fetch subjects");
    }
  };

  const fetchAttendanceDates = async () => {
    try {
      const response = await axios.get(`/auth/attendance/${selectedGrade}/${selectedSubject}/dates`);
      setAttendanceDates(response.data.dates);
    } catch (error) {
      console.error('Failed to fetch attendance dates:', error);
      Alert.alert("Error", "Failed to fetch attendance dates");
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const response = await axios.get(`/auth/attendance/${selectedGrade}/${selectedSubject}/${selectedDate}`);
      console.log(response.data.attendance); // Add this line to inspect the structure
      setAttendanceData(response.data.attendance);
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
      Alert.alert("Error", "Failed to fetch attendance data");
    }
  };
  const handleGradeChange = (grade) => {
    setSelectedGrade(grade);
    setSelectedSubject('');
    setSelectedDate('');
    setAttendanceData([]); // Clear previous attendance data
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    setSelectedDate('');
    setAttendanceData([]); // Clear previous attendance data
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    
    // No need to clear attendance data here as it will be fetched for the new date
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>See Attendance</Text>
      <Picker
        selectedValue={selectedGrade}
        onValueChange={handleGradeChange}
        style={styles.picker}>
        <Picker.Item label="Select a grade" value="" />
        {grades.map((grade, index) => (
          <Picker.Item key={index} label={grade} value={grade} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedSubject}
        onValueChange={handleSubjectChange}
        style={styles.picker}>
        <Picker.Item label="Select a subject" value="" />
        {subjects.map((subject, index) => (
          <Picker.Item key={index} label={subject.name} value={subject._id} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedDate}
        onValueChange={handleDateChange}
        style={styles.picker}>
        <Picker.Item label="Select a date" value="" />
        {attendanceDates.map((date, index) => (
          
          <Picker.Item key={index} label={date} value={date} />
        ))}
      </Picker>
      <Text style={styles.dateText}>Date: {selectedDate.split('T')[0]}</Text>

      <ScrollView style={styles.attendanceContainer}>
  {attendanceData.map((record, index) => (
    record.attendance.map((entry, subIndex) => (
      <View key={`${index}-${subIndex}`} style={styles.attendanceItem}>
       {/* Now accessing 'entry.userId.name' to get the student's name */}
        <Text>{entry.userId.name}: {entry.status}</Text>
      </View>
    ))
  ))}
</ScrollView>

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
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
    width: '90%',
    backgroundColor: '#fafafa',
  },
  picker: {
    width: '100%',
    
  },
  attendanceContainer: {
    marginTop: 20,
    width: '100%',
    
    
    

    
  },
  attendanceItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
});

export default SeeAttendance;









// const fetchSubjects = async () => {
//   try {
//     const response = await axios.get('/auth/subjects');
//     setSubjects(response.data.subjects);
//   } catch (error) {
//     console.error('Failed to fetch subjects:', error);
//     Alert.alert("Error", "Failed to fetch subjects");
//   }
// };