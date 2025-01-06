import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

const StudentForm = () => {
  const [grades, setGrades] = useState([
    'Grade 1',
    'Grade 2',
    'Grade 3',
    'Grade 4',
    'Grade 5',
    'Grade 6',
    'Grade 7',
    'Grade 8',
  ]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [users, setUsers] = useState([]);

  const [fontsLoaded] = useFonts({
    'Kanit-Medium': require('../assets/fonts/Kanit-Medium.ttf'),
  });

  const onLayoutRootView = React.useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

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
      Alert.alert('Error', `Failed to fetch users for grade ${grade}`);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/auth/subjects');
      setSubjects(response.data.subjects);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      Alert.alert('Error', 'Failed to fetch subjects');
    }
  };

  const toggleEnrollment = async (userId, isEnrolled) => {
    try {
      if (isEnrolled) {
        await axios.post('/auth/users/unenrollSubject', {
          userId,
          subjectId: selectedSubject,
        });
        Alert.alert('Success', 'User unenrolled from subject successfully');
      } else {
        await axios.post('/auth/users/registerSubject', {
          userId,
          subjectId: selectedSubject,
        });
        Alert.alert('Success', 'User enrolled in subject successfully');
      }
      fetchUsersByGrade(selectedGrade); // Refresh user list
    } catch (error) {
      const action = isEnrolled ? 'unenroll' : 'enroll';
      console.error(`Failed to ${action} user ${userId} for subject ${selectedSubject}:`, error);
      Alert.alert('Error', `Failed to ${action} user for subject`);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Grade Picker */}
        <View style={styles.pickerWrapper}>
          <Text style={styles.label}>Select Grade:</Text>
          <RNPickerSelect
            onValueChange={(value) => setSelectedGrade(value)}
            items={grades.map((grade) => ({ label: grade, value: grade }))}
            placeholder={{ label: 'Select a grade', value: null }}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
            Icon={() => <Text style={styles.icon}>▼</Text>}
          />
        </View>

        {/* Subject Picker */}
        <View style={styles.pickerWrapper}>
          <Text style={styles.label}>Select Subject:</Text>
          <RNPickerSelect
            onValueChange={(value) => setSelectedSubject(value)}
            items={subjects.map((subject) => ({
              label: subject.name,
              value: subject._id,
            }))}
            placeholder={{ label: 'Select a subject', value: null }}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
            Icon={() => <Text style={styles.icon}>▼</Text>}
          />
        </View>

        {/* Users List with Enroll/Unenroll Button */}
        {users.map((user) => {
          const isEnrolled = user.subjects?.includes(selectedSubject);
          return (
            <View key={user._id} style={styles.userContainer}>
              <Text style={styles.userName}>{user.name}</Text>
              <TouchableOpacity
                style={[
                  styles.button,
                  isEnrolled ? styles.unenrollButton : styles.enrollButton,
                ]}
                onPress={() => toggleEnrollment(user._id, isEnrolled)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    isEnrolled ? styles.unenrollText : styles.enrollText,
                  ]}
                >
                  {isEnrolled ? 'Unenroll' : 'Enroll'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F9FB',
  },
  scrollView: {
    paddingBottom: 20,
  },
  pickerWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Kanit-Medium',
    marginBottom: 5,
  },
  icon: {
    color: '#888',
    fontSize: 18,
  },
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
    color: '#333',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  enrollButton: {
    backgroundColor: '#4CAF50',
  },
  unenrollButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Kanit-Medium',
    color: '#FFFFFF',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    color: '#333',
    backgroundColor: '#FFFFFF',
    paddingRight: 30,
    fontFamily: 'Kanit-Medium',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    color: '#333',
    backgroundColor: '#FFFFFF',
    paddingRight: 30,
    fontFamily: 'Kanit-Medium',
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


 