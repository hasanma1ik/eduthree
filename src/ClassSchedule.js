import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment-timezone';
import { MaterialIcons } from '@expo/vector-icons';

const ClassSchedule = () => {
    const [classSchedules, setClassSchedules] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const formatDate = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const convertToLocalTime = (utcTime) => {
        // Assuming utcTime is in 'HH:mm' format
        return moment.utc(utcTime, 'HH:mm').local().format('h:mm A');
    };

    const fetchClassSchedules = async (date) => {
        const formattedDate = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
        try {
            const response = await axios.get(`/auth/class-schedules/logged-in-user?date=${formattedDate}`);
            const schedulesWithLocalTimes = response.data.classSchedules.map(schedule => ({
                ...schedule,
                startTime: convertToLocalTime(schedule.startTime),
                endTime: convertToLocalTime(schedule.endTime),
            }));
            setClassSchedules(schedulesWithLocalTimes || []);
        } catch (error) {
            console.error('Failed to fetch class schedules:', error);
            Alert.alert("Error", "Failed to fetch class schedules");
        }
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        setSelectedDate(selectedDate || selectedDate);
        fetchClassSchedules(selectedDate || selectedDate);
    };

    const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

    useEffect(() => {
        fetchClassSchedules(selectedDate);
    }, []);

    return (
        <View style={styles.container}>
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
                        <Text style={styles.subject}>{schedule.subject}</Text>
                        <Text style={styles.info}><MaterialIcons name="schedule" size={14} /> {schedule.dayOfWeek} {schedule.startTime} - {schedule.endTime}</Text>
                        <Text style={styles.info}><MaterialIcons name="person" size={14} /> {schedule.teacher.name}</Text>
                    </View>
                )) : <Text style={styles.noSchedules}>No class schedules found for the selected date.</Text>}
            </ScrollView>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scheduleList: {
        marginTop: 20,
    },
    scheduleItem: {
        backgroundColor: '#e3f2fd',
        padding: 20,
        marginBottom: 10,
        borderRadius: 10,
        marginHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    subject: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    info: {
        fontSize: 14,
        marginLeft: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    datePickerButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1976d2',
        margin: 20,
        padding: 10,
        borderRadius: 5,
    },
    datePickerButtonText: {
        color: 'white',
        marginRight: 10,
    },
    noSchedules: {
        textAlign: 'center',
        marginTop: 20,
    },
    dateHeading: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
});

export default ClassSchedule;
