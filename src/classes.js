import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { useIsFocused, useNavigation } from '@react-navigation/native';

const ClassesScreen = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const isFocused = useIsFocused();
  const navigation = useNavigation();

  // Fetch all classes
  const fetchClasses = async () => {
    try {
      const response = await axios.get('/auth/classes');
      setClasses(response.data);
      if (response.data.length > 0) {
        setSelectedClass(response.data[0]._id); // Automatically select the first class
        fetchSubjects(response.data[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  // Fetch subjects for a given class
  const fetchSubjects = async (classId) => {
    try {
      const response = await axios.get(`/auth/subjects/class/${classId}`);
      setSubjects(response.data.subjects);
      if (response.data.subjects.length > 0) {
        setSelectedSubject(response.data.subjects[0]._id); // Automatically select the first subject
      } else {
        setSelectedSubject(null);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  // Refresh classes and subjects when the screen is focused
  useEffect(() => {
    if (isFocused) {
      fetchClasses();
    }
  }, [isFocused]);

  // Refresh subjects when selectedClass changes
  useEffect(() => {
    if (selectedClass) {
      fetchSubjects(selectedClass);
    }
  }, [selectedClass]);

  

  return (
    <View style={styles.container}>
      <Text>Select a class:</Text>
      <Picker
        selectedValue={selectedClass}
        onValueChange={(itemValue) => {
          setSelectedClass(itemValue);
        }}
        style={styles.picker}>
        {classes.map((cls) => (
          <Picker.Item label={cls.grade} value={cls._id} key={cls._id} />
        ))}
      </Picker>

      <Text>Select a subject:</Text>
      <Picker
        selectedValue={selectedSubject}
        onValueChange={(itemValue) => setSelectedSubject(itemValue)}
        style={styles.picker}>
        {subjects.length > 0 ? (
          subjects.map((subject) => (
            <Picker.Item label={subject.name} value={subject._id} key={subject._id} />
          ))
        ) : (
          <Picker.Item label="No subjects available" value={null} />
        )}
      </Picker>

      <Button
        title="Mark Attendance"
        onPress={() =>
          navigation.navigate('AttendanceScreen', {
            classId: selectedClass,
            subjectId: selectedSubject,
          })
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
});

export default ClassesScreen;
