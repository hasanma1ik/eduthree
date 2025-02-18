import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, Platform
} from 'react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment-timezone';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from './screen/context/authContext';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

const ClassSchedule = () => {
    const [state] = useContext(AuthContext);
    const { user } = state;

    const [classSchedules, setClassSchedules] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [fontsLoaded] = useFonts({
        'Kanit-Medium': require('../assets/fonts/Kanit-Medium.ttf'),
    });

    const onLayoutRootView = React.useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    // Function to get the last 5 days (including today)
    const getRecentDates = () => {
        let dates = [];
        for (let i = -2; i <= 2; i++) {
            let newDate = moment().add(i, 'days');
            dates.push({
                day: newDate.format('ddd'),
                date: newDate.format('DD'),
                fullDate: newDate.toDate()
            });
        }
        return dates;
    };

    const [recentDates, setRecentDates] = useState(getRecentDates());

    const getTimezoneFromCountry = (country) => {
        switch (country) {
            case "Pakistan":
                return "Asia/Karachi";
            case "Saudi Arabia":
                return "Asia/Riyadh";
            case "United Arab Emirates":
                return "Asia/Dubai";
            default:
                return "UTC";
        }
    };

    const convertToLocalTime = (utcTime, timezone) => {
        return moment.tz(utcTime, 'HH:mm', 'UTC').tz(timezone).format('h:mm A');
    };

    // Modified fetchClassSchedules to add startMoment and endMoment
    const fetchClassSchedules = async (date) => {
        const formattedDate = moment(date).format('YYYY-MM-DD');
        try {
            const response = await axios.get(`/auth/class-schedules/logged-in-user?date=${formattedDate}`);
            const timezone = getTimezoneFromCountry(user?.country);

            const schedulesWithLocalTimes = response.data.classSchedules.map(schedule => {
                const localStartTime = convertToLocalTime(schedule.startTime, timezone);
                const localEndTime = convertToLocalTime(schedule.endTime, timezone);
                const startMoment = moment(`${formattedDate} ${localStartTime}`, "YYYY-MM-DD h:mm A");
                const endMoment = moment(`${formattedDate} ${localEndTime}`, "YYYY-MM-DD h:mm A");
                return {
                    ...schedule,
                    startTime: localStartTime,
                    endTime: localEndTime,
                    startMoment,
                    endMoment,
                };
            });
            setClassSchedules(schedulesWithLocalTimes || []);
        } catch (error) {
            console.error('Failed to fetch class schedules:', error);
            Alert.alert("Error", "Failed to fetch class schedules");
        }
    };

    const handleDateSelection = (date) => {
        setSelectedDate(date);
        fetchClassSchedules(date);
    };

    const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

    useEffect(() => {
        fetchClassSchedules(selectedDate);
    }, []);

    // Helper function to format duration
    const formatDuration = (duration) => {
        const hours = Math.floor(duration.asHours());
        const minutes = Math.floor(duration.asMinutes()) % 60;
        if (hours > 0) {
            return `${hours} hr ${minutes} min`;
        } else {
            return `${minutes} min`;
        }
    };

    // Compute ongoing class (only if selected date is today)
    const now = moment();
    let ongoingClass = null;
    if (moment(selectedDate).isSame(now, 'day')) {
        for (let schedule of classSchedules) {
            if (schedule.startMoment && schedule.endMoment && now.isBetween(schedule.startMoment, schedule.endMoment)) {
                ongoingClass = schedule;
                break;
            }
        }
    }

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container} onLayout={onLayoutRootView}>
            {/* Ongoing Class Feature */}
            <View style={styles.ongoingContainer}>
                {ongoingClass ? (
                    <View style={styles.ongoingClassBox}>
                        <Text style={styles.ongoingTitle}>Ongoing Class</Text>
                        <Text style={styles.ongoingInfo}>Course: {ongoingClass.subject.name}</Text>
                        <Text style={styles.ongoingInfo}>👩‍🏫 {ongoingClass.teacher.name}</Text>
<Text style={styles.ongoingInfo}>Time: {ongoingClass.startTime} - {ongoingClass.endTime}</Text>

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

            {/* Class Schedule Heading and Date Picker */}
            <View style={styles.headerRow}>
                <Text style={styles.scheduleTitle}>Class Schedule</Text>
                <TouchableOpacity onPress={toggleDatePicker} style={styles.monthYearPicker}>
                    <Text style={styles.monthYearText}>{moment(selectedDate).format("MMM YYYY")}</Text>
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

            {/* Date Selection Row */}
            <View style={styles.dateRow}>
                {recentDates.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.dateBox,
                            selectedDate.toDateString() === item.fullDate.toDateString() && styles.selectedDate
                        ]}
                        onPress={() => handleDateSelection(item.fullDate)}
                    >
                        <Text style={[
                            styles.dayText,
                            selectedDate.toDateString() === item.fullDate.toDateString() && styles.selectedDayText
                        ]}>
                            {item.day}
                        </Text>
                        <Text style={[
                            styles.dateText,
                            selectedDate.toDateString() === item.fullDate.toDateString() && styles.selectedDateText
                        ]}>
                            {item.date}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Schedule List */}
            <ScrollView style={styles.scheduleList}>
                {classSchedules.length > 0 ? classSchedules.map((schedule, index) => (
                    <View key={index} style={styles.scheduleItem}>
                        <Text style={styles.subject}>{schedule.subject.name}</Text>
                        <Text style={styles.info}>🕒 {schedule.startTime} - {schedule.endTime}</Text>
                        <Text style={styles.info}>👩‍🏫 {schedule.teacher.name}</Text>
                    </View>
                )) : (
                    <Text style={styles.noSchedules}>No class schedules found for the selected date.</Text>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white', padding: 15 },
    /* Ongoing Class Feature */
    ongoingContainer: {
        marginVertical: 20,
    },
    ongoingClassBox: {
        backgroundColor: '#DFF5E1',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 20,
    },
    ongoingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        fontFamily: 'Kanit-Medium',
        color: '#018749',
    },
    ongoingInfo: {
        fontSize: 16,
        color: '#555',
        marginBottom: 5,
        fontFamily: 'Kanit-Medium',
    },
    noOngoing: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        fontFamily: 'Kanit-Medium',
    },
    /* Header Row */
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    scheduleTitle: {
        fontSize: 20,
        color: '#018749',
        fontFamily: 'Kanit-Medium'
    },
    monthYearPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
    },
    monthYearText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'black',
        marginRight: 5,
    },
    /* Date Selection Row */
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    dateBox: {
        width: 60,
        height: 75,
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
    },
    selectedDate: {
        backgroundColor: '#006A4E',
    },
    dayText: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Kanit-Medium',
    },
    selectedDayText: {
        color: 'white',
    },
    dateText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'black',
    },
    selectedDateText: {
        color: 'white',
    },
    /* Schedule List */
    scheduleList: { marginTop: 10 },
    scheduleItem: {
        backgroundColor: '#F8F8F8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    subject: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    info: { fontSize: 14, color: '#555', marginBottom: 3 },
    noSchedules: { textAlign: 'center', marginTop: 10, color: '#888' },
});

export default ClassSchedule;
