import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  SafeAreaView, 
  TouchableOpacity 
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons'; // For custom icons

const TakeAttendance = () => {
  const [grades, setGrades] = useState(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8']);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [users, setUsers] = useState([]);
  const [userAttendance, setUserAttendance] = useState({});
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [fontsLoaded] = useFonts({
    'Kanit-Medium': require('../assets/fonts/Kanit-Medium.ttf'),
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
      fetchUsersByGradeAndSubject();
    }
  }, [selectedGrade, selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/auth/subjects');
      setSubjects(response.data.subjects.map(subject => ({ label: subject.name, value: subject._id })));
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      Alert.alert("Error", "Failed to fetch subjects");
    }
  };

  const fetchUsersByGradeAndSubject = async () => {
    try {
      const response = await axios.get(`/auth/class/grade/${selectedGrade}/subject/${selectedSubject}/users`);
      setUsers(response.data);
      const initialAttendance = response.data.reduce((acc, user) => ({ ...acc, [user._id]: '' }), {});
      setUserAttendance(initialAttendance);
    } catch (error) {
      console.error(`Failed to fetch users:`, error);
      Alert.alert("Error", `Failed to fetch users`);
    }
  };

  const submitAttendance = async () => {
    // Validation: Ensure all users have a status selected
    for (let userId in userAttendance) {
      if (userAttendance[userId] === '') {
        Alert.alert("Validation Error", "Please mark attendance for all users.");
        return;
      }
    }

    try {
      const response = await axios.post('/auth/attendance', {
        date: formatDate(date),
        grade: selectedGrade,
        subject: selectedSubject,
        attendance: Object.entries(userAttendance).map(([userId, status]) => ({ userId, status }))
      });
      Alert.alert("Success", "Attendance submitted successfully!");
      // Reset the form
      setSelectedGrade('');
      setSelectedSubject('');
      setDate(new Date());
      setUserAttendance({});
      setUsers([]);
    } catch (error) {
      console.error("Failed to submit attendance:", error);
      Alert.alert("Error", "Failed to submit attendance.");
    }
  };

  const onChangeDate = (event, selectedDate) => {
    if (selectedDate) {
      const offset = selectedDate.getTimezoneOffset() * 60000;
      const localDate = new Date(selectedDate.getTime() - offset);
      setDate(localDate);
    }
    setShowDatePicker(Platform.OS === 'ios');
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleAttendanceChange = (userId, status) => {
    setUserAttendance(prevState => ({ ...prevState, [userId]: status }));
  };

  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container} onLayout={onLayoutRootView}>
        
        <ScrollView contentContainerStyle={styles.scrollView}>

          {/* Date Picker */}
          <View style={styles.datePickerContainer}>
            <TouchableOpacity onPress={showDatepicker} style={styles.button}>
              <Ionicons name="ios-calendar" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Select Date</Text>
            </TouchableOpacity>
            <Text style={styles.dateText}>Selected Date: {formatDate(date)}</Text>
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={onChangeDate}
              />
            )}
          </View>

          {/* Grade Picker */}
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              onValueChange={value => setSelectedGrade(value)}
              items={grades.map(grade => ({ label: grade, value: grade }))}
              placeholder={{ label: "Select a grade", value: null }}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false} // Ensure custom styles are applied on Android
              Icon={() => {
                return <Ionicons name="ios-arrow-down" size={24} color="white" />;
              }}
            />
          </View>

          {/* Subject Picker */}
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              onValueChange={value => setSelectedSubject(value)}
              items={subjects}
              placeholder={{ label: "Select a subject", value: null }}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
              Icon={() => {
                return <Ionicons name="ios-arrow-down" size={24} color="white" />;
              }}
            />
          </View>

          {/* Users Attendance */}
          {users.map((user) => (
            <View key={user._id} style={styles.userContainer}>
              <Text style={styles.userName}>{user.name}</Text>
              <RNPickerSelect
                onValueChange={(value) => handleAttendanceChange(user._id, value)}
                items={[
                  { label: "Present", value: "Present" },
                  { label: "Absent", value: "Absent" },
                  { label: "Late", value: "Late" },
                ]}
                placeholder={{ label: "Select Status", value: null }}
                style={pickerSelectStyles}
                useNativeAndroidPickerStyle={false}
                Icon={() => {
                  return <Ionicons name="ios-arrow-down" size={24} color="white" />;
                }}
              />
            </View>
          ))}

        </ScrollView>

        {/* Submit Button */}
        <TouchableOpacity onPress={submitAttendance} style={styles.submitButton}>
          <Ionicons name="ios-checkmark-circle" size={20} color="white" style={styles.submitButtonIcon} />
          <Text style={styles.submitButtonText}>Submit Attendance</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white', // Black background for the safe area
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9F9F9', // Black background
  },
  header: {
    fontSize: 24,
    fontFamily: 'Kanit-Medium',
    color: 'white',
    marginBottom: 20,
    marginTop: 20, // Adjusted to bring the header down
    textAlign: 'center',
  },
  scrollView: {
    alignItems: 'center',
  },
  datePickerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#FF0000', // Red button
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
    marginLeft: 10,
  },
  dateText: {
    color: 'black',
    fontFamily: 'Kanit-Medium',
    marginTop: 10,
    fontSize: 16,
  },
  pickerWrapper: {
    width: '90%',
    marginBottom: 20,
  },
  userContainer: {
    width: '90%',
    backgroundColor: 'white', // Darker shade for user container
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Kanit-Medium',
    color: 'black',
    marginBottom: 10,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50', // Green button
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '90%',
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
    marginLeft: 10,
  },
  submitButtonIcon: {
    marginRight: 5,
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
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'black', // White border
    borderRadius: 8,
    color: 'black', // White text
    backgroundColor: 'white', // Dark background
    paddingRight: 30, // To ensure the text is never behind the icon
    fontFamily: 'Kanit-Medium',
  },
  placeholder: {
    color: 'black', // White placeholder text
    fontFamily: 'Kanit-Medium',
  },
  iconContainer: {
    top: 12,
    right: 10,
  },
});

export default TakeAttendance;
