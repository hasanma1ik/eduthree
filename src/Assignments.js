import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Picker } from '@react-native-picker/picker';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [fontsLoaded] = useFonts({
    'Kanit-Medium': require('../assets/fonts/Kanit-Medium.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/auth/subjects');
      setSubjects(response.data.subjects);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      Alert.alert("Error", "Failed to fetch subjects");
    }
  };

  const fetchAssignments = async (subjectId) => {
    try {
      const response = await axios.get(`/auth/assignments?subject=${subjectId}`);
      setAssignments(response.data);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      Alert.alert("Error", "Failed to fetch assignments");
    }
  };

  const handleSubjectChange = (subjectId) => {
    setSelectedSubject(subjectId);
    fetchAssignments(subjectId);
  };

  const deleteAssignment = async (assignmentId) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this assignment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", 
          onPress: async () => {
            try {
              await axios.delete(`/auth/assignments/${assignmentId}`);
              setAssignments(prev => prev.filter(a => a._id !== assignmentId));
              Alert.alert("Success", "Assignment deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete assignment");
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={styles.container} onLayout={onLayoutRootView}>
      <Text style={styles.header}>Your Assignments</Text>
      <Picker
        selectedValue={selectedSubject}
        style={styles.picker}
        onValueChange={(itemValue) => handleSubjectChange(itemValue)}
      >
        <Picker.Item label="Select a subject" value="" />
        {subjects.map((subject) => (
          <Picker.Item key={subject._id} label={subject.name} value={subject._id} />
        ))}
      </Picker>
      {assignments.length > 0 ? (
        assignments.map((assignment, index) => (
          <View key={index} style={styles.assignmentItem}>
            <View style={styles.assignmentHeader}>
              <Text style={styles.assignmentTitle}>{assignment.title}</Text>
              <TouchableOpacity onPress={() => deleteAssignment(assignment._id)}>
                <FontAwesome5 name="trash" size={14} color={"red"} />
              </TouchableOpacity>
            </View>
            <Text style={styles.assignmentDescription}>{assignment.description}</Text>
            <Text style={styles.assignmentMetaText1}>Due Date: {assignment.dueDate}</Text>
            <Text style={styles.assignmentMetaText}>Grade: {assignment.grade}</Text>
            <Text style={styles.assignmentMetaText}>Teacher: {assignment.createdBy.name}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noAssignmentsText}>No assignments found for the selected subject.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    fontSize: 24,
    fontFamily: 'Kanit-Medium',
    marginVertical: 20,
    textAlign: 'center',
    color: '#333',
    marginRight: 120,
  },
  picker: {
    height: 50,
    width: '90%',
    alignSelf: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  assignmentItem: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignmentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  assignmentDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  assignmentMetaText: {
    fontSize: 14,
    color: '#008080',
  },
  assignmentMetaText1: {
    color: '#FF0000',
  },
  noAssignmentsText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 20,
  }
});

export default Assignments;
