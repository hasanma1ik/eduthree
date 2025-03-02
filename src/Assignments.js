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

// IMPORTANT: If you want to open local files, or handle downloads from remote URLs:
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';

const Assignments = () => {
  const [state] = useContext(AuthContext);
  const currentUser = state.user;

  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [gradeSubjectMap, setGradeSubjectMap] = useState({});

  const [expandedAssignment, setExpandedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  const [fontsLoaded] = useFonts({
    'Kanit-Medium': require('../assets/fonts/Kanit-Medium.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Fetch teacher data (grades & subjects).
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

  // When grade changes, load subjects for that grade
  useEffect(() => {
    if (selectedGrade && gradeSubjectMap[selectedGrade]) {
      setSubjects(gradeSubjectMap[selectedGrade]);
      setSelectedSubject('');
    } else {
      setSubjects([]);
      setSelectedSubject('');
    }
  }, [selectedGrade, gradeSubjectMap]);

  // Fetch assignments by grade & subject
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!selectedGrade || !selectedSubject) {
        setAssignments([]);
        return;
      }
      try {
        const response = await axios.get(
          `/auth/assignments?grade=${encodeURIComponent(selectedGrade)}&subject=${encodeURIComponent(selectedSubject)}`
        );
        setAssignments(response.data || []);
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
        Alert.alert('Error', 'Failed to fetch assignments');
      }
    };
    fetchAssignments();
  }, [selectedGrade, selectedSubject]);

  // Delete assignment
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
              setAssignments((prev) => prev.filter((a) => a._id !== assignmentId));
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

  // Expand assignment to load submissions
  const toggleExpandAssignment = async (assignmentId) => {
    if (expandedAssignment === assignmentId) {
      // Collapse if already expanded
      setExpandedAssignment(null);
      setSubmissions([]);
    } else {
      setExpandedAssignment(assignmentId);
      try {
        const response = await axios.get(`/auth/submission?assignmentId=${assignmentId}`);
        setSubmissions(response.data.submissions || []);
      } catch (error) {
        console.error('Failed to fetch submissions:', error);
        Alert.alert('Error', 'Failed to fetch submissions for this assignment');
      }
    }
  };

  /**
   * Attempt to "download" or open file. 
   * - If filePath starts with "http", we do a real download to device cache, then open it via an Intent (Android).
   * - If filePath is "file://", we try to open the local file. (This only works if that file actually exists on the teacher's device.)
   * - If no scheme is recognized, fallback to opening as-is with an Intent.
   */
  const handleDownloadFile = async (filePath, fileName, fileType = 'application/octet-stream') => {
    try {
      if (filePath.startsWith('http')) {
        // Remote URL: Download to device's cache
        const downloadResumable = FileSystem.createDownloadResumable(
          filePath,
          FileSystem.cacheDirectory + fileName
        );
        const { uri } = await downloadResumable.downloadAsync();

        // Then open the downloaded file using an external viewer
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: uri,
          flags: 1,
          type: fileType,
        });

      } else if (filePath.startsWith('file://')) {
        // Local file on teacher's device? Convert to content URI, then open
        const contentUri = await FileSystem.getContentUriAsync(filePath);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 1,
          type: fileType,
        });

      } else {
        // Fallback to opening as-is
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: filePath,
          flags: 1,
          type: fileType,
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Failed', `Could not open file: ${error.message}`);
    }
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
          <TouchableOpacity
            key={assignment._id}
            style={styles.assignmentItem}
            onPress={() => toggleExpandAssignment(assignment._id)}
          >
            <View style={styles.assignmentHeader}>
              <Text style={styles.assignmentTitle}>{assignment.title}</Text>
              <TouchableOpacity onPress={() => deleteAssignment(assignment._id)}>
                <FontAwesome5 name="trash" size={14} color="red" />
              </TouchableOpacity>
            </View>
            <Text style={styles.assignmentDescription}>{assignment.description}</Text>
            <Text style={styles.assignmentMetaText}>Due Date: {assignment.dueDate}</Text>
            <Text style={styles.assignmentMetaText}>Grade: {assignment.grade}</Text>
            <Text style={styles.assignmentMetaText}>
              Subject: {assignment.subject.name || assignment.subject}
            </Text>

            {/* Display submissions if this assignment is expanded */}
            {expandedAssignment === assignment._id && (
              <View style={styles.submissionsContainer}>
                {submissions.length > 0 ? (
                  submissions.map((sub) => (
                    <View key={sub._id} style={styles.submissionItem}>
                      <Text style={styles.submissionText}>
                        Student: {sub.userId && sub.userId.name ? sub.userId.name : 'Unknown Student'}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleDownloadFile(sub.filePath, sub.fileName, sub.fileType)}
                      >
                        <Text
                          style={[
                            styles.submissionText,
                            { textDecorationLine: 'underline', color: 'blue' },
                          ]}
                        >
                          File: {sub.fileName}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noSubmissionsText}>
                    No submissions for this assignment.
                  </Text>
                )}
              </View>
            )}
          </TouchableOpacity>
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
    backgroundColor: '#E0E0E0',
    padding: 20,
  },
  pickerWrapper: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
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
    flex: 1,
    marginRight: 10,
  },
  assignmentDescription: {
    fontSize: 15,
    fontFamily: 'Kanit-Medium',
    color: '#555555',
    marginBottom: 12,
  },
  assignmentMetaText: {
    fontSize: 13,
    color: 'red',
    fontFamily: 'Kanit-Medium',
  },
  noAssignmentsText: {
    textAlign: 'center',
    color: '#AAAAAA',
    fontSize: 16,
    marginTop: 30,
    fontFamily: 'Kanit-Medium',
  },
  submissionsContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  submissionItem: {
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  submissionText: {
    fontSize: 14,
    fontFamily: 'Kanit-Medium',
    color: '#333333',
  },
  noSubmissionsText: {
    fontSize: 14,
    fontFamily: 'Kanit-Medium',
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default Assignments;
