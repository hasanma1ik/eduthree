import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';

const ClassSchedule = () => {
  const [classSchedules, setClassSchedules] = useState([]);

  useEffect(() => {
    fetchClassSchedules();
  }, []);

  const fetchClassSchedules = async () => {
    try {
      const response = await axios.get('/auth/class-schedules');
      setClassSchedules(response.data.classSchedules);
    } catch (error) {
      console.error("Failed to fetch class schedules:", error);
      // Handle error here, e.g., set an error state, show a message, etc.
    }
  };

  return (
    <ScrollView style={styles.container}>
      {classSchedules.map((schedule, index) => (
        <View key={index} style={styles.scheduleItem}>
          <Text style={styles.subject}>{schedule.subject}</Text>
          <Text>Day: {schedule.dayOfWeek}</Text>
          <Text>Time: {schedule.startTime} - {schedule.endTime}</Text>
          <Text>Teacher: {schedule.teacher.name}</Text>
          {/* Assuming the teacher object includes a name. Adjust accordingly. */}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  scheduleItem: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
  },
  subject: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Add more styles as needed
});

export default ClassSchedule;
