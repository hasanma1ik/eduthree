import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import moment from 'moment-timezone';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import RNPickerSelect from 'react-native-picker-select';

const CreateClasses = () => {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [terms, setTerms] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]); // Fetch subjects from backend

  const grades = [
    'Grade 1',
    'Grade 2',
    'Grade 3',
    'Grade 4',
    'Grade 5',
    'Grade 6',
    'Grade 7',
    'Grade 8',
    'Grade 9',
  ];

  const timeSlots = [
    '8:00 AM - 9:00 AM',
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchTeachers();
    fetchTerms();
    fetchSubjects();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('/auth/teachers');
      setTeachers(response.data.teachers);
      console.log("Fetched Teachers:", response.data.teachers); // Debugging Line
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch teachers');
    }
  };

  const fetchTerms = async () => {
    try {
      const response = await axios.get('/auth/terms');
      setTerms(response.data.terms);
      console.log("Fetched Terms:", response.data.teerms); // Debugging Line
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch terms');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/auth/subjects');
      setSubjects(response.data.subjects);
      console.log("Fetched Subjects:", response.data.subjects); // Debugging Line
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      Alert.alert('Error', 'Failed to fetch subjects');
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
    if (
      selectedGrade === '' ||
      selectedSubject === '' ||
      selectedTimeSlot === '' ||
      selectedDay === '' ||
      selectedTeacher === '' ||
      selectedTerm === ''
    ) {
      Alert.alert('Validation Error', 'Please fill all fields');
      return;
    }

    try {
      const [startTime, endTime] = selectedTimeSlot.split(' - ');
      const format = 'h:mm A';
      const utcStartTime = moment.tz(startTime, format, moment.tz.guess()).utc().format('HH:mm');
      const utcEndTime = moment.tz(endTime, format, moment.tz.guess()).utc().format('HH:mm');
      const utcTimeSlot = `${utcStartTime} - ${utcEndTime}`;

      const postData = {
        grade: selectedGrade,
        subject: selectedSubject, // Subject ID
        timeSlot: utcTimeSlot,
        day: selectedDay,
        teacher: selectedTeacher,
        term: selectedTerm,
      };

      console.log("Creating Class with Data:", postData); // Debugging Line

      const response = await axios.post('/auth/grades', postData);
      Alert.alert('Success', 'Class created successfully');
      // Optionally reset the form
      setSelectedGrade('');
      setSelectedSubject('');
      setSelectedTimeSlot('');
      setSelectedDay('');
      setSelectedTeacher('');
      setSelectedTerm('');
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
      Alert.alert('Error', errorMessage);
    }
  };

  const [fontsLoaded] = useFonts({
    'Kanit-Medium': require('../assets/fonts/Kanit-Medium.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <Text style={styles.mainTitle}></Text>

      {/* Grade Picker */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Grade</Text>
        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={(value) => setSelectedGrade(value)}
            items={grades.map((grade) => ({ label: grade, value: grade }))}
            placeholder={{ label: 'Select Grade', value: null }}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
            Icon={() => {
              return <Text style={styles.icon}>▼</Text>;
            }}
            value={selectedGrade}
          />
        </View>
      </View>

      {/* Subject Picker */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Subject</Text>
        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={(value) => setSelectedSubject(value)}
            items={subjects.map((subject) => ({ label: subject.name, value: subject._id }))}
            placeholder={{ label: 'Select Subject', value: null }}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
            Icon={() => {
              return <Text style={styles.icon}>▼</Text>;
            }}
            value={selectedSubject}
          />
        </View>
      </View>

      {/* Time Slot Picker */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Time Slot</Text>
        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={(value) => setSelectedTimeSlot(value)}
            items={timeSlots.map((slot) => ({ label: slot, value: slot }))}
            placeholder={{ label: 'Select Time Slot', value: null }}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
            Icon={() => {
              return <Text style={styles.icon}>▼</Text>;
            }}
            value={selectedTimeSlot}
          />
        </View>
      </View>
      

      {/* Day Picker */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Day</Text>
        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={(value) => setSelectedDay(value)}
            items={days.map((day) => ({ label: day, value: day }))}
            placeholder={{ label: 'Select Day', value: null }}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
            Icon={() => {
              return <Text style={styles.icon}>▼</Text>;
            }}
            value={selectedDay}
          />
        </View>
      </View>

      {/* Teacher Picker */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Teacher</Text>
        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={(value) => setSelectedTeacher(value)}
            items={teachers.map((teacher) => ({ label: teacher.name, value: teacher._id }))}
            placeholder={{ label: 'Select Teacher', value: null }}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
            Icon={() => {
              return <Text style={styles.icon}>▼</Text>;
            }}
            value={selectedTeacher}
          />
        </View>
      </View>

      {/* Term Picker */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Term</Text>
        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={(value) => setSelectedTerm(value)}
            items={terms.map((term) => ({ label: term.name, value: term._id }))}
            placeholder={{ label: 'Select Term', value: null }}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
            Icon={() => {
              return <Text style={styles.icon}>▼</Text>;
            }}
            value={selectedTerm}
          />
        </View>
      </View>

      {/* Create Class Button */}
      <TouchableOpacity style={styles.button} onPress={createGrade}>
        <Text style={styles.buttonText}>Create Class</Text>
      </TouchableOpacity>

      {/* Display Selected Time Slot */}
      {selectedTimeSlot && (
        <Text style={styles.localTimeSlot}>{selectedTimeSlot}</Text> // Directly display the selected time slot
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 120,
    backgroundColor: '#F4F6F8', 
  },
  mainTitle: {
    fontSize: 26,
    fontFamily: 'Kanit-Medium',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: -30, // Adjust this value as needed to bring the title down
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Kanit-Medium',
    color: 'white',
    marginTop: -100,
    marginLeft: 10,
    position: 'absolute',
    top: 10,
    left: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
    color: 'black',
    marginBottom: 5,
  },
  pickerWrapper: {
    marginBottom: 20,
  },
  icon: {
    color: 'black',
    fontSize: 18,
    paddingRight: 10,
  },
  button: {
    backgroundColor: '#018749', // Green button
    borderRadius: 8,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
  },
  localTimeSlot: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
    color: '#04AA6D',
    fontFamily: 'Kanit-Medium',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'white', // White border
    borderRadius: 8,
    color: 'white', // White text
    backgroundColor: '#333333', // Dark background
    paddingRight: 30, // To ensure the text is never behind the icon
    fontFamily: 'Kanit-Medium',
    marginBottom: -20,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'black', // Black border
    borderRadius: 8,
    color: 'black', // Black text
    backgroundColor: 'white', // White background
    paddingRight: 30, // To ensure the text is never behind the icon
    fontFamily: 'Kanit-Medium',
    marginBottom: -20,
  },
  placeholder: {
    color: 'black', // Black placeholder text
    fontFamily: 'Kanit-Medium',
  },
});

export default CreateClasses;

