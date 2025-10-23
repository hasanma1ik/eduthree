// src/ClassSchedule.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment-timezone';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from './screen/context/authContext';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useNavigation } from '@react-navigation/native';

const ClassSchedule = () => {
  const [state] = useContext(AuthContext);
  const user = state?.user;
  const role = (user?.role || '').toLowerCase(); // 'student' | 'teacher' | 'admin'
  const navigation = useNavigation();

  const [classSchedules, setClassSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [fontsLoaded] = useFonts({
    'Kanit-Medium': require('../assets/fonts/Kanit-Medium.ttf'),
    'Ubuntu-Bold': require('../assets/fonts/Ubuntu-Bold.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  const getRecentDates = () => {
    const dates = [];
    for (let i = -2; i <= 2; i++) {
      const d = moment().add(i, 'days');
      dates.push({
        day: d.format('ddd'),
        date: d.format('DD'),
        fullDate: d.toDate(),
      });
    }
    return dates;
  };
  const recentDates = getRecentDates();

  const getTimezoneFromCountry = (country) => {
    switch (country) {
      case 'Pakistan':
        return 'Asia/Karachi';
      case 'Saudi Arabia':
        return 'Asia/Riyadh';
      case 'United Arab Emirates':
        return 'Asia/Dubai';
      default:
        return 'UTC';
    }
  };

  const convertToLocalTime = (utcTime, timezone) =>
    moment.tz(utcTime, 'HH:mm', 'UTC').tz(timezone).format('h:mm A');

  const fetchClassSchedules = async (date) => {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    try {
      // same endpoint; backend decides by role
      const { data } = await axios.get(
        `/auth/class-schedules/logged-in-user?date=${formattedDate}`
      );

      const timezone = getTimezoneFromCountry(user?.country);
      const withLocal = (data.classSchedules || []).map((schedule) => {
        const localStart = convertToLocalTime(schedule.startTime, timezone);
        const localEnd = convertToLocalTime(schedule.endTime, timezone);
        const startMoment = moment(
          `${formattedDate} ${localStart}`,
          'YYYY-MM-DD h:mm A'
        );
        const endMoment = moment(
          `${formattedDate} ${localEnd}`,
          'YYYY-MM-DD h:mm A'
        );
        return {
          ...schedule,
          startTime: localStart,
          endTime: localEnd,
          startMoment,
          endMoment,
        };
      });
      setClassSchedules(withLocal);
    } catch (error) {
      console.error('Failed to fetch class schedules:', error?.response?.data || error);
      Alert.alert('Error', 'Failed to fetch class schedules');
    }
  };

  useEffect(() => {
    fetchClassSchedules(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateSelection = (date) => {
    setSelectedDate(date);
    fetchClassSchedules(date);
  };

  const now = moment();
  const isToday = moment(selectedDate).isSame(now, 'day');

  const formatDuration = (duration) => {
    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.asMinutes()) % 60;
    return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
    };

  let ongoingClass = null;
  if (isToday) {
    for (const schedule of classSchedules) {
      if (
        schedule.startMoment &&
        schedule.endMoment &&
        now.isBetween(schedule.startMoment, schedule.endMoment)
      ) {
        ongoingClass = schedule;
        break;
      }
    }
  }

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      {/* Header */}
      <View style={styles.topHalf}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {role === 'teacher' ? 'My Teaching Schedule' : 'Class Schedule'}
        </Text>
        <TouchableOpacity
          style={styles.profileContainer}
          onPress={() => navigation.navigate('Account')}
        >
          <Image
            source={{
              uri:
                user?.profilePicture ||
                'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png',
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Ongoing class highlight */}
      <View style={styles.ongoingContainer}>
        {ongoingClass ? (
          <View style={styles.ongoingClassBox}>
            <Text style={styles.ongoingTitle}>Ongoing Class</Text>
            <Text style={styles.ongoingInfo}>Course: {ongoingClass?.subject?.name}</Text>
            {role === 'student' ? (
              <Text style={styles.ongoingInfo}>👩‍🏫 {ongoingClass?.teacher?.name}</Text>
            ) : (
              <Text style={styles.ongoingInfo}>👩‍🏫 You</Text>
            )}
            {!!ongoingClass?.classId?.grade && (
              <Text style={styles.ongoingInfo}>Section: {ongoingClass.classId.grade}</Text>
            )}
            <Text style={styles.ongoingInfo}>
              Time: {ongoingClass.startTime} - {ongoingClass.endTime}
            </Text>
            <Text style={styles.ongoingInfo}>
              Elapsed: {formatDuration(moment.duration(now.diff(ongoingClass.startMoment)))}
            </Text>
            <Text style={styles.ongoingInfo}>
              Left: {formatDuration(moment.duration(ongoingClass.endMoment.diff(now)))}
            </Text>
          </View>
        ) : (
          <View style={styles.ongoingClassBox}>
            <Text style={styles.noOngoing}>No ongoing class</Text>
          </View>
        )}
      </View>

      {/* Month picker */}
      <View style={styles.headerRow}>
        <Text style={styles.scheduleTitle}>Class Schedule</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker((s) => !s)}
          style={styles.monthYearPicker}
        >
          <Text style={styles.monthYearText}>
            {moment(selectedDate).format('MMM YYYY')}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={20} color="black" />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, newDate) => {
            if (newDate) {
              setSelectedDate(newDate);
              fetchClassSchedules(newDate);
            }
            setShowDatePicker(false);
          }}
        />
      )}

      {/* Quick date row */}
      <View style={styles.dateRow}>
        {recentDates.map((item, idx) => {
          const selected = selectedDate.toDateString() === item.fullDate.toDateString();
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.dateBox, selected && styles.selectedDate]}
              onPress={() => handleDateSelection(item.fullDate)}
            >
              <Text style={[styles.dayText, selected && styles.selectedDayText]}>
                {item.day}
              </Text>
              <Text style={[styles.dateText, selected && styles.selectedDateText]}>
                {item.date}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <ScrollView style={styles.scheduleList}>
        {classSchedules.length > 0 ? (
          classSchedules.map((schedule, index) => (
            <View key={index} style={styles.scheduleItem}>
              <Text style={styles.subject}>{schedule?.subject?.name}</Text>
              {!!schedule?.classId?.grade && (
                <Text style={styles.info}>📘 {schedule.classId.grade}</Text>
              )}
              <Text style={styles.info}>
                🕒 {schedule.startTime} - {schedule.endTime}
              </Text>
              {role === 'student' ? (
                <Text style={styles.info}>👩‍🏫 {schedule?.teacher?.name}</Text>
              ) : (
                <Text style={styles.info}>👩‍🏫 You</Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noSchedules}>
            No class schedules found for the selected date.
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 15 },

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
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: { position: 'absolute', top: 59, left: 10, padding: 10, zIndex: 1 },
  profileContainer: { position: 'absolute', top: 57, right: 10, padding: 5, zIndex: 1 },
  profileImage: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#fff',
  },
  headerTitle: { fontSize: 18, color: '#FFFFFF', fontFamily: 'Ubuntu-Bold' },

  ongoingContainer: { marginVertical: 20 },
  ongoingClassBox: {
    backgroundColor: '#DFF5E1',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  ongoingTitle: { fontSize: 18, fontFamily: 'Kanit-Medium', marginBottom: 10, color: '#018749' },
  ongoingInfo: { fontSize: 16, color: '#555', marginBottom: 5, fontFamily: 'Kanit-Medium' },
  noOngoing: { fontSize: 16, color: '#888', textAlign: 'center', fontFamily: 'Kanit-Medium' },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  scheduleTitle: { fontSize: 20, color: '#018749', fontFamily: 'Kanit-Medium' },
  monthYearPicker: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 5, paddingHorizontal: 10,
    backgroundColor: '#E0E0E0', borderRadius: 5,
  },
  monthYearText: { fontSize: 14, fontWeight: 'bold', color: 'black', marginRight: 5 },

  dateRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  dateBox: {
    width: 60, height: 75, backgroundColor: '#F0F0F0', borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', padding: 5,
  },
  selectedDate: { backgroundColor: '#006A4E' },
  dayText: { fontSize: 14, color: '#666', fontFamily: 'Kanit-Medium' },
  selectedDayText: { color: 'white' },
  dateText: { fontSize: 22, fontWeight: 'bold', color: 'black' },
  selectedDateText: { color: 'white' },

  scheduleList: { marginTop: 10 },
  scheduleItem: {
    backgroundColor: '#F8F8F8', padding: 15, borderRadius: 10, marginBottom: 10,
    borderWidth: 1, borderColor: '#E0E0E0',
  },
  subject: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  info: { fontSize: 14, color: '#555', marginBottom: 3 },
  noSchedules: { textAlign: 'center', marginTop: 10, color: '#888' },
});

export default ClassSchedule;
