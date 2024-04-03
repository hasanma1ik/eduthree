import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert, Platform } from 'react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import the component

const ClassSchedule = () => {
    const [classSchedules, setClassSchedules] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Fetch class schedules for the selected date
    const fetchClassSchedules = async (date) => {
        const formattedDate = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
        try {
            // Adjust the endpoint as necessary
            const response = await axios.get(`/class-schedules/logged-in-user?date=${formattedDate}`);

            setClassSchedules(response.data.classSchedules || []);
        } catch (error) {
            console.error('Failed to fetch class schedules:', error);
            Alert.alert("Error", "Failed to fetch class schedules");
        }
    };

    // Handler for date change
    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios'); // Hide picker on Android after selection
        const currentDate = selectedDate || selectedDate;
        setSelectedDate(currentDate);
        fetchClassSchedules(currentDate); // Fetch schedules for the new date
    };

    // Toggle the date picker visibility
    const toggleDatePicker = () => {
        setShowDatePicker(!showDatePicker);
    };

    useEffect(() => {
        fetchClassSchedules(selectedDate); // Initial fetch for today's schedules
    }, []);

    return (
        <View style={styles.container}>
            <Button title="Select Date" onPress={toggleDatePicker} />
            {showDatePicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={selectedDate}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={onDateChange}
                />
            )}
            <ScrollView style={styles.scheduleList}>
                {classSchedules.length > 0 ? classSchedules.map((schedule, index) => (
                    <View key={index} style={styles.scheduleItem}>
                        <Text style={styles.subject}>{schedule.subject}</Text>
                        <Text>Day: {schedule.dayOfWeek}</Text>
                        <Text>Time: {schedule.startTime} - {schedule.endTime}</Text>
                        <Text>Teacher: {schedule.teacher.name}</Text>
                    </View>
                )) : <Text>No class schedules found for the selected date.</Text>}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scheduleList: {
        marginTop: 15,
    },
    scheduleItem: {
        backgroundColor: '#f0f0f0',
        padding: 15,
        marginBottom: 10,
        borderRadius: 5,
        marginHorizontal: 10,
    },
    subject: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Add more styles as needed
});

export default ClassSchedule;
