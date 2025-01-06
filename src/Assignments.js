import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Picker } from '@react-native-picker/picker';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { AuthContext } from './screen/context/authContext';

const Assignments = () => {
  const [state] = useContext(AuthContext);
  const currentUser = state.user;

  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [gradeSubjectMap, setGradeSubjectMap] = useState({});

  const [fontsLoaded] = useFonts({
    'Kanit-Medium': require('../assets/fonts/Kanit-Medium.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const response = await axios.get(`/auth/teacher/${currentUser._id}/data`);

        if (response.data) {
          setGrades(response.data.grades || []);
          setGradeSubjectMap(response.data.gradeSubjectMap || {});
        }
      } catch (error) {
        console.error('Failed to fetch teacher data:', error);
        Alert.alert('Error', 'Failed to fetch teacher data');
      }
    };

    fetchTeacherData();
  }, [currentUser]);

  useEffect(() => {
    if (selectedGrade && gradeSubjectMap[selectedGrade]) {
      setSubjects(gradeSubjectMap[selectedGrade]);
      setSelectedSubject(''); // Reset subject dropdown when grade changes
    } else {
      setSubjects([]);
      setSelectedSubject('');
    }
  }, [selectedGrade, gradeSubjectMap]);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!selectedGrade || !selectedSubject) {
        setAssignments([]);
        return;
      }

      try {
        const response = await axios.get(
          `/auth/assignments?grade=${encodeURIComponent(
            selectedGrade
          )}&subject=${encodeURIComponent(selectedSubject)}`
        );
        setAssignments(response.data || []);
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
        Alert.alert('Error', 'Failed to fetch assignments');
      }
    };

    fetchAssignments();
  }, [selectedGrade, selectedSubject]);

  const deleteAssignment = async (assignmentId) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this assignment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await axios.delete(`/auth/assignments/${assignmentId}`);
              setAssignments((prev) =>
                prev.filter((a) => a._id !== assignmentId)
              );
              Alert.alert('Success', 'Assignment deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete assignment');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={styles.container} onLayout={onLayoutRootView}>
      {/* Grade Dropdown */}
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedGrade}
          onValueChange={(itemValue) => setSelectedGrade(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select a Grade" value="" />
          {grades.map((grade) => (
            <Picker.Item
              key={grade._id || grade}
              label={grade.name || grade.toString()}
              value={grade._id || grade}
            />
          ))}
        </Picker>
      </View>

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
              key={subject._id || subject}
              label={subject.name || subject.toString()}
              value={subject._id || subject}
            />
          ))}
        </Picker>
      </View>

      {/* Assignments List */}
      {assignments.length > 0 ? (
        assignments.map((assignment) => (
          <View key={assignment._id} style={styles.assignmentItem}>
            <View style={styles.assignmentHeader}>
              <Text style={styles.assignmentTitle}>{assignment.title}</Text>
              <TouchableOpacity
                onPress={() => deleteAssignment(assignment._id)}
              >
                <FontAwesome5 name="trash" size={14} color="red" />
              </TouchableOpacity>
            </View>
            <Text style={styles.assignmentDescription}>
              {assignment.description}
            </Text>
            <Text style={styles.assignmentMetaText}>
              Due Date: {assignment.dueDate}
            </Text>
            <Text style={styles.assignmentMetaText}>
              Grade: {assignment.grade}
            </Text>
            <Text style={styles.assignmentMetaText}>
              Subject: {assignment.subject.name || assignment.subject}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.noAssignmentsText}>
          No assignments found for the selected grade and subject.
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
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  assignmentTitle: {
    fontSize: 18,
    fontFamily: 'Kanit-Medium',
    color: '#333333',
    flex: 1, // Ensures the title takes up available space
    marginRight: 10, // Space between title and trash icon
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


export default Assignments;
