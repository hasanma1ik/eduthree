import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment-timezone'; // Import moment-timezone
import { Ionicons } from '@expo/vector-icons';

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
  const timeSlots = ['5:41 PM - 6:46 PM', '8:00 AM - 9:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '12:00 PM - 1:00 PM', '9:00 PM - 10:00 PM', '10:30 PM - 11:30 PM'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchTeachers();
    fetchTerms();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('/auth/teachers');
      setTeachers(response.data.teachers);
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

    try {
      const response = await axios.post('/auth/grades', postData);
      Alert.alert("Success", "Class created successfully");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An unexpected error occurred";
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Class</Text>
        <Ionicons name="ios-school" size={40} color="#04AA6D" />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Grade</Text>
        <View style={styles.pickerContainer}>
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
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Subject</Text>
        <View style={styles.pickerContainer}>
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
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Time Slot</Text>
        <View style={styles.pickerContainer}>
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
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Day</Text>
        <View style={styles.pickerContainer}>
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
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Teacher</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedTeacher}
            onValueChange={setSelectedTeacher}
            style={styles.picker}
          >
            <Picker.Item label="Select Teacher" value="" />
            {teachers.map((teacher, index) => (
              <Picker.Item key={index} label={teacher.name} value={teacher._id} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Term</Text>
        <View style={styles.pickerContainer}>
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
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={createGrade}>
        <Text style={styles.buttonText}>Create Class</Text>
      </TouchableOpacity>

      {selectedTimeSlot && (
        <Text style={styles.localTimeSlot}>{displayLocalTimeSlot(selectedTimeSlot)}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 10,
    paddingBottom: 120,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#04AA6D',
    marginRight: 5,
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 5,
  },
  pickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#04AA6D',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    height: 50,
  },
  picker: {
    width: '100%',
    height: 40,
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#04AA6D',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  localTimeSlot: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
    color: '#04AA6D',
  },
});

export default CreateClasses;
