import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from './screen/context/authContext';

const StudentAssignments = () => {
  const [state] = useContext(AuthContext);
  const currentUser = state.user;

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
    const fetchSubjects = async () => {
      try {
        const response = await axios.get('/auth/subjects'); // Fetch subjects
        setSubjects(response.data.subjects || []);
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
        Alert.alert('Error', 'Failed to fetch subjects');
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!selectedSubject) {
        setAssignments([]);
        return;
      }

      try {
        const response = await axios.get(
          `/auth/assignments?grade=${encodeURIComponent(
            currentUser.grade
          )}&subject=${encodeURIComponent(selectedSubject)}`
        );
        setAssignments(response.data || []);
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
        Alert.alert('Error', 'Failed to fetch assignments');
      }
    };

    fetchAssignments();
  }, [selectedSubject]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={styles.container} onLayout={onLayoutRootView}>
      {/* Display Fixed Grade */}
      <Text style={styles.gradeText}>Grade: {currentUser.grade}</Text>

      {/* Subject Dropdown */}
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedSubject}
          onValueChange={(itemValue) => setSelectedSubject(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select a Subject" value="" />
          {subjects.map((subject) => (
            <Picker.Item
              key={subject._id}
              label={subject.name}
              value={subject._id}
            />
          ))}
        </Picker>
      </View>

      {/* Assignments List */}
      {assignments.length > 0 ? (
        assignments.map((assignment) => (
          <View key={assignment._id} style={styles.assignmentItem}>
            <Text style={styles.assignmentTitle}>{assignment.title}</Text>
            <Text style={styles.assignmentDescription}>
              {assignment.description}
            </Text>
            <Text style={styles.assignmentMetaText}>
              Due Date: {assignment.dueDate}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.noAssignmentsText}>
          No assignments found for the selected subject.
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#E0E0E0', // Softer background color for better contrast
      padding: 20,
    },
    gradeText: {
      fontSize: 18,
      fontFamily: 'Kanit-Medium',
      color: '#00308F', // Dark blue for better visibility
      marginBottom: 20,
      textAlign: 'center',
    },
    pickerWrapper: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#DDDDDD',
      backgroundColor: '#FFFFFF',
      marginBottom: 20,
      overflow: 'hidden',
      // iOS Shadow
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      // Android Shadow
      elevation: 3,
    },
    picker: {
      height: 50,
      color: '#333333',
      fontSize: 16,
      paddingHorizontal: 10,
    },
    assignmentItem: {
      marginBottom: 20,
      padding: 20,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#EEEEEE',
      // iOS Shadow
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      // Android Shadow
      elevation: 2,
    },
    assignmentTitle: {
      fontSize: 18,
      fontFamily: 'Kanit-Medium',
      color: '#333333',
      flex: 1, // Ensures the title takes up available space
      marginBottom: 10,
    },
    assignmentDescription: {
      fontSize: 15,
      fontFamily: 'Kanit-Medium',
      color: '#555555',
      marginBottom: 12,
    },
    assignmentMetaText: {
      fontSize: 13,
      color: 'red', // Slightly brighter red for better visibility
      fontFamily: 'Kanit-Medium',
    },
    noAssignmentsText: {
      textAlign: 'center',
      color: '#AAAAAA',
      fontSize: 16,
      marginTop: 30,
      fontFamily: 'Kanit-Medium',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#555555',
      fontFamily: 'Kanit-Medium',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      fontSize: 18,
      color: '#FF6B6B',
      textAlign: 'center',
      fontFamily: 'Kanit-Medium',
    },
  });
  

export default StudentAssignments;
