import React, { useState, useEffect, useCallback, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput,
  Image,
  Platform
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from './screen/context/authContext';
import moment from 'moment-timezone';

const TakeAttendance = () => {
  const [state] = useContext(AuthContext);
  const { user, token } = state;
  const navigation = useNavigation();

  // Teacher-specific data for grades and subjects
  const [grades, setGrades] = useState([]);
  const [gradeSubjectMap, setGradeSubjectMap] = useState({});

  // Sample terms array
  const [terms, setTerms] = useState([
    { name: 'Spring 2025', start: '2025-01-15', end: '2025-05-29' },
    { name: 'Fall 2024', start: '2024-09-01', end: '2024-12-15' },
    { name: 'Summer 2024', start: '2024-06-01', end: '2024-08-31' },
  ]);
  const [selectedTerm, setSelectedTerm] = useState('');

  // Local selections
  const [selectedGrade, setSelectedGrade] = useState('');
  // Store full subject objects so we can later check scheduledDays property
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [users, setUsers] = useState([]);
  const [userAttendance, setUserAttendance] = useState({});

  // For searchable student dropdown
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    'Ubuntu-Bold': require('../assets/fonts/Ubuntu-Bold.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Fetch teacher-specific data
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const response = await axios.get(`/auth/teacher/${user._id}/data`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data) {
          // Sort grades numerically
          const sortedGrades = (response.data.grades || []).sort((a, b) => {
            const numA = parseInt(a.replace(/[^0-9]/g, ''), 10);
            const numB = parseInt(b.replace(/[^0-9]/g, ''), 10);
            return numA - numB;
          });
          setGrades(sortedGrades);
          setGradeSubjectMap(response.data.gradeSubjectMap || {});
          if (sortedGrades.length > 0) setSelectedGrade(sortedGrades[0]);
        }
      } catch (error) {
        console.error('Failed to fetch teacher data:', error);
        Alert.alert('Error', 'Failed to fetch teacher data');
      }
    };
    fetchTeacherData();
  }, [user, token]);

  // Determine current term based on today's date
  useEffect(() => {
    const today = moment();
    const currentTerm = terms.find(term =>
      today.isBetween(
        moment(term.start, 'YYYY-MM-DD'),
        moment(term.end, 'YYYY-MM-DD'),
        'day',
        '[]'
      )
    );
    if (currentTerm) {
      setSelectedTerm(currentTerm.name);
    } else {
      setSelectedTerm(terms[0]?.name || '');
    }
  }, [terms]);

  // Warn if a non-current term is selected
  const handleTermChange = (newTerm) => {
    const today = moment();
    const currentTerm = terms.find(term =>
      today.isBetween(moment(term.start, 'YYYY-MM-DD'), moment(term.end, 'YYYY-MM-DD'), 'day', '[]')
    );
    if (currentTerm && currentTerm.name !== newTerm) {
      Alert.alert(
        'Warning',
        `Are you sure you want to select ${newTerm} as your current term?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK', onPress: () => setSelectedTerm(newTerm) }
        ]
      );
    } else {
      setSelectedTerm(newTerm);
    }
  };

  // Update subjects when grade changes; deduplicate by subject name and store full objects
  useEffect(() => {
    if (selectedGrade && gradeSubjectMap[selectedGrade]) {
      const uniqueSubjects = Array.from(
        new Map(gradeSubjectMap[selectedGrade].map(item => [item.name, item])).values()
      );
      setSubjects(uniqueSubjects);
      setSelectedSubject(null);
    } else {
      setSubjects([]);
      setSelectedSubject(null);
    }
  }, [selectedGrade, gradeSubjectMap]);

  // Fetch users by grade and subject
  useEffect(() => {
    if (selectedGrade && selectedSubject) {
      const fetchUsers = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/auth/class/grade/${selectedGrade}/subject/${selectedSubject._id}/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers(response.data);
          const initialAttendance = response.data.reduce((acc, user) => ({ ...acc, [user._id]: '' }), {});
          setUserAttendance(initialAttendance);
          setLoading(false);
        } catch (error) {
          console.error('Failed to fetch users:', error);
          setLoading(false);
          Alert.alert("Error", "Failed to fetch users");
        }
      };
      fetchUsers();
    } else {
      setUsers([]);
      setUserAttendance({});
    }
  }, [selectedGrade, selectedSubject, token]);

  // Filter students by search term
  const filteredStudents = users.filter(student =>
    student.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Before submitting attendance, check if the selected date is a scheduled day for the subject.
  const submitAttendance = async () => {
    // Ensure attendance is marked for all users
    for (let userId in userAttendance) {
      if (userAttendance[userId] === '') {
        Alert.alert("Validation Error", "Please mark attendance for all users.");
        return;
      }
    }

    // Check if the selected subject has a scheduledDays array and validate the weekday.
    if (selectedSubject && selectedSubject.scheduledDays) {
      const weekday = moment(date).format('dddd'); // e.g., "Monday"
      if (!selectedSubject.scheduledDays.includes(weekday)) {
        Alert.alert("Error", `Attendance for ${selectedSubject.name} is not scheduled on ${weekday}.`);
        return;
      }
    }

    try {
      await axios.post('/auth/attendance', {
        date: formatDate(date),
        grade: selectedGrade,
        subject: selectedSubject._id,
        attendance: Object.entries(userAttendance).map(([userId, status]) => ({ userId, status }))
      });
      Alert.alert("Success", "Attendance submitted successfully!");
      // Reset the form
      setSelectedGrade('');
      setSelectedSubject(null);
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
      <View style={styles.container}>
        {/* Custom Header */}
        <View style={styles.topHalf}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="ios-arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Take Attendance</Text>
          <TouchableOpacity style={styles.profileContainer} onPress={() => navigation.navigate('Account')}>
            <Image
              source={{ uri: user?.profilePicture || 'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
  
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
              useNativeAndroidPickerStyle={false}
              Icon={() => <Ionicons name="ios-arrow-down" size={24} color="white" />}
            />
          </View>
  
          {/* Subject Picker */}
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              onValueChange={value => setSelectedSubject(value)}
              // Store full subject objects so that scheduledDays is available
              items={subjects.map(subject => ({ label: subject.name, value: subject }))}
              placeholder={{ label: "Select a subject", value: null }}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
              Icon={() => <Ionicons name="ios-arrow-down" size={24} color="white" />}
            />
          </View>
  
          {/* Users Attendance */}
          {users.map((userItem) => (
            <View key={userItem._id} style={styles.userContainer}>
              <Text style={styles.userName}>{userItem.name}</Text>
              <RNPickerSelect
                onValueChange={(value) => handleAttendanceChange(userItem._id, value)}
                items={[
                  { label: "Present", value: "Present" },
                  { label: "Absent", value: "Absent" },
                  { label: "Late", value: "Late" },
                ]}
                placeholder={{ label: "Select Status", value: null }}
                style={pickerSelectStyles}
                useNativeAndroidPickerStyle={false}
                Icon={() => <Ionicons name="ios-arrow-down" size={24} color="white" />}
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
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  topHalf: {
    width: 393,
    height: 128,
    backgroundColor: '#006446',
    alignSelf: 'center',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 10,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 59,
    left: 10,
    padding: 10,
    zIndex: 1,
  },
  pageTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Ubuntu-Bold',
  },
  profileContainer: {
    position: 'absolute',
    top: 57,
    right: 10,
    padding: 5,
    zIndex: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  scrollView: {
    alignItems: 'center',
  },
  datePickerContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#FF0000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
    marginLeft: 10,
  },
  dateText: {
    color: 'black',
    fontFamily: 'Ubuntu-Bold',
    marginTop: 10,
    fontSize: 16,
  },
  pickerWrapper: {
    width: '90%',
    marginBottom: 20,
  },
  userContainer: {
    width: '90%',
    backgroundColor: 'white',
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
    fontFamily: 'Ubuntu-Bold',
    color: 'black',
    marginBottom: 10,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#006446',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
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
    borderColor: 'white',
    borderRadius: 8,
    color: 'white',
    backgroundColor: '#333333',
    paddingRight: 30,
    fontFamily: 'Ubuntu-Bold',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    color: 'black',
    backgroundColor: 'white',
    paddingRight: 30,
    fontFamily: 'Ubuntu-Bold',
  },
  placeholder: {
    color: 'black',
    fontFamily: 'Ubuntu-Bold',
  },
  iconContainer: {
    top: 12,
    right: 10,
  },
});

export default TakeAttendance;
