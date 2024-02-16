import React, {useState, useEffect } from 'react'
import { View, Text, Button, FlatList } from 'react-native';
import axios from 'axios'; // Make sure to install axios

const AttendanceScreen = ({ classId }) => {
    const [students, setStudents] = useState([])

    useEffect(()=>{
        const fetchStudents = async () =>{
            try {
                const response = await axios.get(`/auth/students/${classId}`)
                setStudents(response.data)
            } catch (error) {
                console.error(error)
            }
        }
        fetchStudents();
    }, [classId])



const markAttendance = async (studentId, status) => {
    try {
      await axios.post('/auth/attendance/mark', {
        studentId,
        classId,
        date: new Date(),
        status,
      });
      // Optionally refresh the list or show a confirmation message
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View>
      <FlatList
        data={students}
        renderItem={({ item }) => (
          <View>
            <Text>{item.name}</Text>
            <Button title="Present" onPress={() => markAttendance(item._id, 'present')} />
            <Button title="Absent" onPress={() => markAttendance(item._id, 'absent')} />
          </View>
        )}
        keyExtractor={item => item._id}
      />
    </View>
  );
};

export default AttendanceScreen;