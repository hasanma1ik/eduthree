import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
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

    const formatDate = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const getTimezoneFromCountry = (country) => {
        switch (country) {
            case "Pakistan":
                return "Asia/Karachi";
            case "Saudi Arabia":
                return "Asia/Riyadh";
            case "United Arab Emirates":
                return "Asia/Dubai";
            default:
                return "UTC"; // Fallback timezone
        }
    };

    const convertToLocalTime = (utcTime, timezone) => {
        return moment.tz(utcTime, 'HH:mm', 'UTC').tz(timezone).format('h:mm A');
    };

    const fetchClassSchedules = async (date) => {
        const formattedDate = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
        try {
            const response = await axios.get(`/auth/class-schedules/logged-in-user?date=${formattedDate}`);
            const timezone = getTimezoneFromCountry(user?.country);

            const schedulesWithLocalTimes = response.data.classSchedules.map(schedule => ({
                ...schedule,
                startTime: convertToLocalTime(schedule.startTime, timezone),
                endTime: convertToLocalTime(schedule.endTime, timezone),
            }));
            setClassSchedules(schedulesWithLocalTimes || []);
        } catch (error) {
            console.error('Failed to fetch class schedules:', error);
            Alert.alert("Error", "Failed to fetch class schedules");
        }
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        const currentDate = selectedDate || selectedDate;
        setSelectedDate(currentDate);
        fetchClassSchedules(currentDate);
    };

    const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

    useEffect(() => {
        fetchClassSchedules(selectedDate);
    }, []);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container} onLayout={onLayoutRootView}>
            <Text style={styles.dateHeading}>{formatDate(selectedDate)}</Text>
            <TouchableOpacity onPress={toggleDatePicker} style={styles.datePickerButton}>
                <Text style={styles.datePickerButtonText}>Select Date</Text>
                <MaterialIcons name="calendar-today" size={20} color="white" />
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker value={selectedDate} mode="date" display="default" onChange={onDateChange} />
            )}
            <ScrollView style={styles.scheduleList}>
                {classSchedules.length > 0 ? classSchedules.map((schedule, index) => (
                    <View key={index} style={styles.scheduleItem}>
                        <Text style={styles.subject}>{schedule.subject.name}</Text>
                        <Text style={styles.info}><MaterialIcons name="schedule" size={14} color="white" /> {schedule.dayOfWeek} {schedule.startTime} - {schedule.endTime}</Text>
                        <Text style={styles.info}><MaterialIcons name="person" size={14} color="white" /> {schedule.teacher.name}</Text>
                    </View>
                )) : (
                    <Text style={styles.noSchedules}>No class schedules found for the selected date.</Text>
                )}
            </ScrollView>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        padding: 20,
    },
    dateHeading: {
        fontSize: 20,
        fontFamily: 'Kanit-Medium',
        color: 'black',
        textAlign: 'center',
        marginBottom: 20,
    },
    datePickerButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    datePickerButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Kanit-Medium',
        marginRight: 10,
    },
    scheduleList: {
        marginTop: 10,
    },
    scheduleItem: {
        backgroundColor: '#333333',
        padding: 20,
        borderRadius: 8,
        marginBottom: 10,
        borderColor: '#555555',
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    subject: {
        fontSize: 18,
        fontFamily: 'Kanit-Medium',
        color: 'white',
        marginBottom: 5,
    },
    info: {
        fontSize: 14,
        color: 'white',
        fontFamily: 'Kanit-Medium',
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
    },
    noSchedules: {
        color: '#888',
        fontSize: 16,
        fontFamily: 'Kanit-Medium',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default ClassSchedule;
