import React, { useState, useEffect, useCallback, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView, 
  Alert, 
  SafeAreaView 
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from './screen/context/authContext';

const SeeAttendance = () => {
  const [grades, setGrades] = useState([]);
  const [gradeSubjectMap, setGradeSubjectMap] = useState({});
  const [selectedGrade, setSelectedGrade] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [state] = useContext(AuthContext);
  const navigation = useNavigation();
  const { user, token } = state;

  const [fontsLoaded] = useFonts({
    'Ubuntu-Bold': require('../assets/fonts/Ubuntu-Bold.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  useEffect(() => {
    if (selectedGrade && gradeSubjectMap[selectedGrade]) {
      const subjectsForGrade = gradeSubjectMap[selectedGrade] || [];
      const uniqueSubjects = Array.from(
        new Map(subjectsForGrade.map(s => [s.name, s])).values()
      );
      setSubjects(uniqueSubjects.map(s => ({ label: s.name, value: s._id })));
    } else {
      setSubjects([]);
    }
    setSelectedSubject('');
    setSelectedDate('');
    setAttendanceDates([]);
    setAttendanceData([]);
  }, [selectedGrade]);

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

  const fetchTeacherData = async () => {
    try {
      const res = await axios.get(`/auth/teacher/${user._id}/data`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sortedGrades = (res.data.grades || []).sort((a, b) => {
        const numA = parseInt(a.replace(/[^0-9]/g, ''));
        const numB = parseInt(b.replace(/[^0-9]/g, ''));
        return numA - numB;
      });

      setGrades(sortedGrades);
      setGradeSubjectMap(res.data.gradeSubjectMap || {});
    } catch (error) {
      console.error('Failed to fetch teacher data:', error);
      Alert.alert('Error', 'Could not load teacher grades and subjects');
    }
  };

  const fetchAttendanceDates = async () => {
    try {
      const res = await axios.get(`/auth/attendance/${selectedGrade}/${selectedSubject}/dates`);
      setAttendanceDates(res.data.dates.map(date => ({ label: date, value: date })));
    } catch (error) {
      console.error('Failed to fetch attendance dates:', error);
      Alert.alert("Error", "Failed to fetch attendance dates");
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const res = await axios.get(`/auth/attendance/${selectedGrade}/${selectedSubject}/${selectedDate}`);
      setAttendanceData(res.data.attendance || []);
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
      Alert.alert("Error", "Failed to fetch attendance data");
    }
  };

  if (!fontsLoaded) return null;


  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
        {/* Custom Header */}
        <View style={styles.topHalf}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                      <FontAwesome5 name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>See Attendance</Text>
        </View>
       
        <ScrollView style={styles.formContainer}>
          
          {/* Grade Picker */}
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              onValueChange={value => setSelectedGrade(value)}
              items={grades.map(grade => ({ label: grade, value: grade }))}
              placeholder={{ label: "Select a grade", value: null }}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false} // Ensure custom styles are applied on Android
              Icon={() => {
                return <Text style={styles.icon}>▼</Text>; // Custom dropdown icon
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
                return <Text style={styles.icon}>▼</Text>;
              }}
            />
          </View>

          {/* Date Picker */}
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              onValueChange={value => setSelectedDate(value)}
              items={attendanceDates}
              placeholder={{ label: "Select a date", value: null }}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
              Icon={() => {
                return <Text style={styles.icon}>▼</Text>;
              }}
            />
          </View>

          {/* Attendance Data */}
          <View style={styles.attendanceContainer}>
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
                    <Text style={styles.statusOther}>{entry.status}</Text>
                  )}
                </View>
              ))
            ))}
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'black', // Black background for the safe area
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#E0E0E0', // Black background
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
  header: {
    fontSize: 24,
    fontFamily: 'Ubuntu-Bold',
    color: 'white',
    marginBottom: 20,
    marginTop: 20, // Adjusted to bring the header down
    textAlign: 'center',
  },
  formContainer: {
    marginTop: 20,
  },
  pickerWrapper: {
    marginBottom: 20,
  },
  attendanceContainer: {
    marginTop: 20,
    width: '100%',
  },
  attendanceItem: {
    backgroundColor: 'white', // Darker shade for attendance items
    borderRadius: 12,
    padding: 15,
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userNameText: {
    // fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
    color: 'black',
  },
  statusPresent: {
    width: 30,
    height: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  
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
    backgroundColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  statusOther: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Bold',
  },
  icon: {
    color: 'white',
    fontSize: 18,
    paddingRight: 10,
  },
  statusText:{
    color: 'white',
    fontFamily: 'Ubuntu-Bold'
  }
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
    fontFamily: 'Ubuntu-Bold',
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
    fontFamily: 'Ubuntu-Bold',
  },
  placeholder: {
    color: 'black', // White placeholder text
    fontFamily: 'Ubuntu-Bold',
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