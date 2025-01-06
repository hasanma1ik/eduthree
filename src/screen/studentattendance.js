import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import { AuthContext } from './context/authContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BarChart } from 'react-native-chart-kit'; // Import BarChart

const StudentAttendance = () => {
  const [state] = useContext(AuthContext);
  const currentUser = state.user;

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
  });

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
        if (record.status.toLowerCase() === 'present') stats.present += 1;
        else if (record.status.toLowerCase() === 'absent') stats.absent += 1;
        else if (record.status.toLowerCase() === 'late') stats.late += 1;
      });
      setAttendanceStats(stats);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      Alert.alert('Error', 'Failed to fetch attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubject) {
      fetchAttendance(selectedSubject);
    }
  }, [selectedSubject]);

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Unable to load attendance. User data is missing.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>{currentUser.name}</Text>
      <Text style={styles.gradeText}>Grade: {currentUser.grade}</Text>
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
          Icon={() => {
            return (
              <MaterialIcons
                name="arrow-drop-down"
                size={24}
                color="#34495e"
              />
            );
          }}
        />
      </View>

      {selectedSubject && (
        <View>
          <Text style={styles.chartTitle}>Attendance Statistics</Text>
          <BarChart
            data={{
              labels: ['Present', 'Absent', 'Late'],
              datasets: [
                {
                  data: [
                    attendanceStats.present,
                    attendanceStats.absent,
                    attendanceStats.late,
                  ],
                  colors: [
                    () => '#2ecc71', // Green for Present
                    () => '#e74c3c', // Red for Absent
                    () => '#34495e', // Black for Late
                  ],
                },
              ],
            }}
            width={Dimensions.get('window').width - 40} // Adjust chart width
            height={220}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: '#f4f4f4',
              backgroundGradientFrom: '#f4f4f4',
              backgroundGradientTo: '#f4f4f4',
              decimalPlaces: 0,
              color: (opacity = 1, index) => {
                const colors = ['#2ecc71', '#e74c3c', '#34495e']; // Green, Red, Black
                return colors[index];
              },
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              barPercentage: 0.7,
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
              alignSelf: 'center',
            }}
          />

<Text style={styles.totalsText}>
            <Text style={styles.presentText}>Present: {attendanceStats.present}</Text>,{' '}
            <Text style={styles.absentText}>Absent: {attendanceStats.absent}</Text>,{' '}
            <Text style={styles.lateText}>Late: {attendanceStats.late}</Text>
          </Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#FF6347" />
      ) : (
        <View style={styles.attendanceList}>
          {attendanceRecords.length > 0 ? (
            attendanceRecords.map((record, index) => (
              <View
                key={index}
                style={[
                  styles.recordCard,
                  record.status.toLowerCase() === 'present'
                    ? styles.present
                    : record.status.toLowerCase() === 'late'
                    ? styles.late
                    : styles.absent,
                ]}
              >
                <Text style={styles.recordText}>Date: {record.date}</Text>
                <Text style={styles.recordText}>
                  Status: {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noRecordsText}>
              No attendance records available.
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontFamily: 'Kanit-Medium',
    color: '#00308F',
    marginBottom: 10,
    textAlign: 'center',
  },
  gradeText: {
    fontSize: 18,
    fontFamily: 'Kanit-Medium',
    color: '#00308F',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerWrapper: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 20,
    fontFamily: 'Kanit-Medium',
    color: '#00308F',
    textAlign: 'center',
    marginVertical: 10,
  },
  totalsText: {
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
    color: '#00308F',
    textAlign: 'center',
    marginBottom: 20,
  },
  presentText: {
    color: '#2ecc71', // Green
  },
  absentText: {
    color: '#e74c3c', // Red
  },
  lateText: {
    color: 'black', // Yellow
  },
  attendanceList: {
    marginTop: 10,
  },
  recordCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'column',
  },
  recordText: {
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
    color: '#ffffff',
  },
  present: {
    backgroundColor: '#006400',
  },
  late: {
    backgroundColor: 'black',
  },
  absent: {
    backgroundColor: 'maroon',
  },
  noRecordsText: {
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
    color: '#e74c3c',
    textAlign: 'center',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
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
    fontFamily: 'Kanit-Medium',
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
    fontFamily: 'Kanit-Medium',
  },
});

export default StudentAttendance;
