import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import { AuthContext } from './context/authContext';
import { useNavigation } from '@react-navigation/native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

const StudentAttendance = () => {
  const [state] = useContext(AuthContext);
  const currentUser = state.user;
  const navigation = useNavigation();
  
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
  });

  // For the date picker card
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Profile Picture
  const profilePicture = currentUser?.profilePicture ||
    'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png';

  /* ===================== FETCH SUBJECTS ON MOUNT ===================== */
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get('/auth/subjects');
        setSubjects(response.data.subjects);
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
        Alert.alert('Error', 'Failed to fetch subjects');
      }
    };
    fetchSubjects();
  }, []);

  /* ===================== FETCH ATTENDANCE ===================== */
  const fetchAttendance = async (subjectId) => {
    if (!subjectId) return;

    try {
      setLoading(true);
      const response = await axios.get('/auth/attendance/student-attendance', {
        params: {
          studentId: currentUser._id,
          grade: currentUser.grade,
          subjectId,
        },
      });

      const records = response.data.attendance;
      setAttendanceRecords(records);

      // Calculate attendance stats
      const stats = { present: 0, absent: 0, late: 0 };
      records.forEach((record) => {
        const status = record.status.toLowerCase();
        if (status === 'present') stats.present += 1;
        else if (status === 'absent') stats.absent += 1;
        else if (status === 'late') stats.late += 1;
      });
      setAttendanceStats(stats);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      Alert.alert('Error', 'Failed to fetch attendance records.');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch attendance whenever subject changes
  useEffect(() => {
    if (selectedSubject) {
      fetchAttendance(selectedSubject);
    }
  }, [selectedSubject]);

  // If user data is missing
  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Unable to load attendance. User data is missing.
        </Text>
      </View>
    );
  }

  // Compute stats
 const totalClasses = attendanceStats.present + attendanceStats.absent + attendanceStats.late;
  // Late counts as present for overall percentage, and we format with 2 decimals.
  const attendancePercentage = totalClasses > 0
    ? (((attendanceStats.present + attendanceStats.late) / totalClasses) * 100).toFixed(2)
    : "0.00";

  /* ===================== DATE PICKER LOGIC ===================== */
  const onPressView = () => {
    setShowDatePicker(true);
  };

  const onChangeDate = (event, newDate) => {
    setShowDatePicker(false);
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

  // Helper function to get day suffix (st, nd, rd, th)
  const getDaySuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  // Compute date values from selectedDate
  const day = selectedDate.getDate();
  const daySuffix = getDaySuffix(day);
  const monthYear = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

   // Compute the Monday of the current school week (Monday-Friday)
   const getMonday = (date) => {
    const day = date.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = date.getDay() === 0 ? -6 : 1 - day; // if Sunday, go back 6 days; otherwise, subtract (day - 1)
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    return monday;
  };

  const monday = getMonday(selectedDate);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  // Compute an array of Date objects for Monday to Friday
  const weekDates = weekDays.map((_, i) => new Date(monday.getTime() + i * 24 * 60 * 60 * 1000));

  // Render the status for each day of the week
  const renderWeekStatus = weekDates.map((d, i) => {
    // Find an attendance record that matches this day (compare using toDateString())
    const record = attendanceRecords.find(rec => {
      const recDate = new Date(rec.date);
      return recDate.toDateString() === d.toDateString();
    });
    let statusSymbol = '-';
    if (record) {
      const status = record.status.toLowerCase();
      if (status === 'present' || status === 'late') {
        statusSymbol = '✓';
      } else if (status === 'absent') {
        statusSymbol = 'A';
      }
    }
    return (
            <View key={i} style={styles.dayCircle}>
              <Text style={styles.dayLabel}>{weekDays[i]}</Text>
              <Text style={record && record.status.toLowerCase() === 'absent' ? [styles.checkIcon, { color: 'red' }] : styles.checkIcon}>
                {statusSymbol}
              </Text>
            </View>
         );
  });

  return (
    <View style={styles.screen}>
      {/* ================= TOP BAR ================= */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileContainer} onPress={() => navigation.navigate('Account')}>
          <Image source={{ uri: profilePicture }} style={styles.profileImage} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>My Attendance</Text>
      </View>

      {/* ================= SCROLL CONTENT ================= */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* ========== "My Attendance" Date Picker Card ========== */}
        <View style={styles.datePickerCard}>
          <View style={styles.datePickerLeft}>
            <FontAwesome5 name="calendar" size={24} color="#006446" />
            <Text style={styles.datePickerText}>My Attendance</Text>
          </View>
          <TouchableOpacity style={styles.viewButton} onPress={onPressView}>
            <Text style={styles.viewButtonText}>VIEW</Text>
          </TouchableOpacity>
        </View>

        {/* Render native date picker if needed */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeDate}
          />
        )}

        {/* === Subject Picker === */}
        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={(value) => setSelectedSubject(value)}
            items={subjects.map((subject) => ({
              label: subject.name,
              value: subject._id,
            }))}
            placeholder={{ label: 'Select a subject', value: null }}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
            Icon={() => (
              <MaterialIcons name="arrow-drop-down" size={24} color="#34495e" />
            )}
          />
        </View>

        {/* === Big Date Card === */}
        <View style={styles.dateCard}>
          <Text style={styles.bigDateText}>
            {day}<Text style={styles.thText}>{daySuffix}</Text>
          </Text>
          <Text style={styles.dayText}>{dayName}</Text>
          <Text style={styles.monthYearText}>{monthYear}</Text>

          {/* Example M T W T F row */}
          <Text style={styles.thisWeekStatus}>This week status</Text>
          <View style={styles.weekRow}>
            {renderWeekStatus}
          </View>
        </View>

        {/* === Stats Section === */}
        {/* Top Attendance Percentage Box */}
        <View style={styles.topStatsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{attendancePercentage}%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalClasses}</Text>
            <Text style={styles.statLabel}>Ongoing Days</Text>
          </View>
        </View>

        

        {/* Row of three boxes: Present, Absent, Late */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{attendanceStats.present}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={[styles.statBox, styles.absentBox]}>
            <Text style={styles.statValue}>{attendanceStats.absent}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={[styles.statBox, styles.lateBox]}>
            <Text style={styles.statValue}>{attendanceStats.late}</Text>
            <Text style={styles.statLabel}>Late</Text>
          </View>
        </View>

        {/* === ASK LEAVE Button === */}
      

        {/* === Loading Indicator === */}
        {loading && (
          <ActivityIndicator size="large" color="#FF6347" style={{ marginTop: 20 }} />
        )}

       {/* === Attendance Records (if any) === */}
       {attendanceRecords.length > 0 && (
          <View style={{ marginTop: 20 }}>
            {attendanceRecords.map((record, index) => {
              // Determine the background style based on status
              const status = record.status.toLowerCase();
              let recordStyle = {};
              if (status === 'present') {
                recordStyle = styles.presentRecordCard;
              } else if (status === 'absent') {
                recordStyle = styles.absentRecordCard;
              } else if (status === 'late') {
                recordStyle = styles.lateRecordCard;
              }
              return (
                <View key={index} style={[styles.recordCard, recordStyle]}>
                  <Text style={styles.recordText}>Date: {record.date}</Text>
                  <Text style={styles.recordText}>
                    Status: {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
        {(!loading && attendanceRecords.length === 0 && selectedSubject) && (
          <Text style={styles.noRecordsText}>No attendance records available.</Text>
        )}
      </ScrollView>
    </View>
  );
};
/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  topStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
  },
  /* Top Bar */
  topBar: {
    width: 393,
    height: 128,
    backgroundColor: '#006446',
    alignSelf: 'center',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 59,
    left: 10,
    padding: 10,
    zIndex: 1,
  },
  profileContainer: {
    position: 'absolute',
    top: 57,
    right: 10,
    padding: 5,
    zIndex: 1,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#fff',
  },
  topBarTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Ubuntu-Bold',
    position: 'absolute',
    top: 10,
    left: 120,
    marginTop: 60,
  },

  /* Main Content Container */
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  /* "My Attendance" Date Picker Card */
  datePickerCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerText: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
    color: '#006446',
  },
  viewButton: {
    backgroundColor: '#006446',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 6,
  },
  viewButtonText: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Bold',
    color: '#fff',
  },

  /* Subject Picker */
  pickerWrapper: {
    marginBottom: 20,
  },

  /* Big Date Card */
  dateCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  bigDateText: {
    fontSize: 48,
    fontFamily: 'Ubuntu-Bold',
    color: '#006446',
    lineHeight: 48,
    marginLeft: -105,
  },
  thText: {
    fontSize: 24,
    fontFamily: 'Ubuntu-Bold',
    color: '#006446',
  },
  dayText: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Regular',
    color: '#333',
  },
  monthYearText: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
    color: '#006446',
    marginBottom: 10,
    top: -50,
    left: 40, 
  },
  thisWeekStatus: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Regular',
    color: '#777',
    marginBottom: 10,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  dayCircle: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Regular',
    color: '#333',
  },
  checkIcon: {
    fontSize: 16,
    color: '#006446',
    fontFamily: 'Ubuntu-Bold',
  },

  /* Stats Section */
  attendanceBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  attendancePercentage: {
    fontSize: 24,
    fontFamily: 'Ubuntu-Bold',
    color: '#006446',
    marginBottom: 5,
  },
  attendanceLabel: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Regular',
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Ubuntu-Bold',
    color: '#006446',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Regular',
    color: '#333',
  },
  absentBox: {
    backgroundColor: '#ffcccc', // light red
  },
  lateBox: {
    backgroundColor: '#ffffcc', // light yellow
  },

  /* ASK LEAVE Button */
  // askLeaveButton: {
  //   backgroundColor: '#006446',
  //   borderRadius: 15,
  //   paddingVertical: 15,
  //   alignItems: 'center',
  //   marginBottom: 20,
  // },
  // askLeaveButtonText: {
  //   fontSize: 18,
  //   fontFamily: 'Ubuntu-Bold',
  //   color: '#fff',
  // },

  /* Detailed Attendance Records */
  recordCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  presentRecordCard: {
    backgroundColor: '#006446', // green for present
  },
  absentRecordCard: {
    backgroundColor: 'maroon', // red for absent
  },
  lateRecordCard: {
    backgroundColor: '#f1c40f', // yellow for late
  },
  recordText: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Regular',
    color: '#ffffff',
  },
  noRecordsText: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Regular',
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Regular',
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 20,
  },
});


/* RNPickerSelect Styles */
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Regular',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: '#34495e',
    backgroundColor: '#ffffff',
    paddingRight: 40,
  },
  inputAndroid: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Regular',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: '#34495e',
    backgroundColor: '#ffffff',
    paddingRight: 40,
  },
  placeholder: {
    color: '#999',
    fontFamily: 'Ubuntu-Regular',
  },
});

export default StudentAttendance;
