import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';

const AttendanceScreen = ({ route }) => {
  const { classId, subjectId } = route.params;
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`/auth/users/${classId}/${subjectId}`); // Adjust endpoint as necessary
        setUsers(response.data); // Ensure this aligns with your API response structure
      } catch (error) {
        console.error("Failed to fetch users:", error);
        Alert.alert("Error", "Failed to fetch users");
      }
    };

    fetchUsers();
  }, [classId, subjectId]);

  const markAttendance = async (userId, status) => {
    try {
      await axios.post('/auth/attendance/mark', {
        userId,
        classId,
        subjectId,
        status,
      });
      Alert.alert("Success", "Attendance marked successfully");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to mark attendance");
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{item.name}</Text>
            <Button title="Present" onPress={() => markAttendance(item._id, 'present')} />
            <Button title="Absent" onPress={() => markAttendance(item._id, 'absent')} />
          </View>
        )}
        keyExtractor={item => item._id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10,
  },
});

export default AttendanceScreen;
