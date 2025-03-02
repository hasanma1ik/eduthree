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
  const attendancePercentage = totalClasses > 0
    ? Math.round((attendanceStats.present / totalClasses) * 100)
    : 0;

  /* ===================== DATE PICKER LOGIC ===================== */
  const onPressView = () => {
    setShowDatePicker(true);
  };

  const onChangeDate = (event, newDate) => {
    // On Android, user can press "Cancel" => newDate = undefined
    setShowDatePicker(false);
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

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

        {/* Render the native date picker if showDatePicker is true */}
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
              <MaterialIcons
                name="arrow-drop-down"
                size={24}
                color="#34495e"
              />
            )}
          />
        </View>

        {/* === Big Date Card === */}
        <View style={styles.dateCard}>
          <Text style={styles.bigDateText}>12<Text style={styles.thText}>th</Text></Text>
          <Text style={styles.dayText}>Wednesday</Text>
          <Text style={styles.monthYearText}>February 2025</Text>
          <Text style={styles.thisWeekStatus}>This week status</Text>

          {/* Example M T W T F row */}
          <View style={styles.weekRow}>
            <View style={styles.dayCircle}>
              <Text style={styles.dayLabel}>Mon</Text>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
            <View style={styles.dayCircle}>
              <Text style={styles.dayLabel}>Tue</Text>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
            <View style={styles.dayCircle}>
              <Text style={styles.dayLabel}>Wed</Text>
              <Text style={[styles.checkIcon, { color: 'red' }]}>A</Text>
            </View>
            <View style={styles.dayCircle}>
              <Text style={styles.dayLabel}>Thu</Text>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
            <View style={styles.dayCircle}>
              <Text style={styles.dayLabel}>Fri</Text>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
          </View>
        </View>

        {/* === Stats Row (Attendance %, Leaves, Ongoing Days) === */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{attendancePercentage}%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {attendanceStats.absent < 10
                ? `0${attendanceStats.absent}`
                : attendanceStats.absent}
            </Text>
            <Text style={styles.statLabel}>Leaves Taken</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {totalClasses < 10 ? `0${totalClasses}` : totalClasses}
            </Text>
            <Text style={styles.statLabel}>Ongoing Days</Text>
          </View>
        </View>

        {/* === ASK LEAVE Button === */}
        <TouchableOpacity style={styles.askLeaveButton}>
          <Text style={styles.askLeaveButtonText}>ASK LEAVE</Text>
        </TouchableOpacity>

        {/* === Loading Indicator === */}
        {loading && (
          <ActivityIndicator size="large" color="#FF6347" style={{ marginTop: 20 }} />
        )}

        {/* === Attendance Records (if any) === */}
        {attendanceRecords.length > 0 && (
          <View style={{ marginTop: 20 }}>
            {attendanceRecords.map((record, index) => (
              <View key={index} style={styles.recordCard}>
                <Text style={styles.recordText}>Date: {record.date}</Text>
                <Text style={styles.recordText}>
                  Status: {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        )}
        {(!loading && attendanceRecords.length === 0 && selectedSubject) && (
          <Text style={styles.noRecordsText}>
            No attendance records available.
          </Text>
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
  },
  thText: {
    fontSize: 24,
    fontFamily: 'Ubuntu-Bold',
    color: '#006446',
  },
  dayText: {
    fontSize: 24,
    fontFamily: 'Ubuntu-Regular',
    color: '#333',
  },
  monthYearText: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Regular',
    color: '#666',
    marginBottom: 10,
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

  /* Stats Row */
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

  /* ASK LEAVE Button */
  askLeaveButton: {
    backgroundColor: '#006446',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  askLeaveButtonText: {
    fontSize: 18,
    fontFamily: 'Ubuntu-Bold',
    color: '#fff',
  },

  /* Detailed Attendance Records (Optional) */
  recordCard: {
    backgroundColor: '#018749',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
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
