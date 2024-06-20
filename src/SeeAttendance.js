import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

const SeeAttendance = () => {
  const [grades, setGrades] = useState(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8']);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);

  const [fontsLoaded] = useFonts({
    'kanitmedium': require('../assets/fonts/Kanit-Medium.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

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
      setSubjects(response.data.subjects.map(subject => ({ label: subject.name, value: subject._id })));
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      Alert.alert("Error", "Failed to fetch subjects");
    }
  };

  const fetchAttendanceDates = async () => {
    try {
      const response = await axios.get(`/auth/attendance/${selectedGrade}/${selectedSubject}/dates`);
      setAttendanceDates(response.data.dates.map(date => ({ label: date, value: date })));
    } catch (error) {
      console.error('Failed to fetch attendance dates:', error);
      Alert.alert("Error", "Failed to fetch attendance dates");
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const response = await axios.get(`/auth/attendance/${selectedGrade}/${selectedSubject}/${selectedDate}`);
      setAttendanceData(response.data.attendance || []);
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
      Alert.alert("Error", "Failed to fetch attendance data");
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <Text style={styles.header}>See Attendance</Text>
      <ScrollView style={styles.formContainer}>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            onValueChange={value => setSelectedGrade(value)}
            items={grades.map(grade => ({ label: grade, value: grade }))}
            placeholder={{ label: "Select a grade", value: null }}
            style={pickerSelectStyles}
          />
        </View>

        <View style={styles.pickerContainer}>
          <RNPickerSelect
            onValueChange={value => setSelectedSubject(value)}
            items={subjects}
            placeholder={{ label: "Select a subject", value: null }}
            style={pickerSelectStyles}
          />
        </View>

        <View style={styles.pickerContainer}>
          <RNPickerSelect
            onValueChange={value => setSelectedDate(value)}
            items={attendanceDates}
            placeholder={{ label: "Select a date", value: null }}
            style={pickerSelectStyles}
          />
        </View>

        <ScrollView style={styles.attendanceContainer}>
          {attendanceData.map((record, index) => (
            record.attendance.map((entry, subIndex) => (
              <View key={`${index}-${subIndex}`} style={styles.attendanceItem}>
                <Text style={styles.userNameText}>{entry.userId.name || 'Unknown'}</Text>
                {entry.status === 'Present' ? (
                  <View style={styles.statusPresent}>
                    <Text style={styles.statusText}>P</Text>
                  </View>
                ) : entry.status === 'Absent' ? (
                  <View style={styles.statusAbsent}>
                    <Text style={styles.statusText}>A</Text>
                  </View>
                ) : entry.status === 'Late' ? (
                  <View style={styles.statusLate}>
                    <Text style={styles.statusText}>L</Text>
                  </View>
                ) : (
                  <Text>{entry.status}</Text>
                )}
              </View>
            ))
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontFamily: 'kanitmedium',
    color: 'black',
    marginBottom: 10,
    marginTop: -20,
  },
  formContainer: {
    marginTop: 10, // Add marginTop to move the form down
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  attendanceContainer: {
    marginTop: 20,
    width: '100%',
  },
  attendanceItem: {
    borderWidth: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userNameText: {
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'kanitmedium',
  },
  statusPresent: {
    width: 30,
    height: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statusAbsent: {
    width: 30,
    height: 30,
    backgroundColor: '#DC3545',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  statusLate: {
    width: 30,
    height: 30,
    backgroundColor: '#343A40',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 4,
    color: 'black',
    backgroundColor: 'white',
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 4,
    color: 'black',
    backgroundColor: 'white',
    paddingRight: 30,
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