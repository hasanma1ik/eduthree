import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image
} from 'react-native';
import axios from 'axios';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Picker } from '@react-native-picker/picker';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { AuthContext } from './screen/context/authContext';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';

const StudentAssignments = () => {
  const [state] = useContext(AuthContext);
  const currentUser = state.user || {};
  const navigation = useNavigation();

  // Profile Picture
  const profilePicture = currentUser?.profilePicture ||
    'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png';

  // Main state
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  // Font loading
  const [fontsLoaded] = useFonts({
    'Ubuntu-Light': require('../assets/fonts/Ubuntu-Light.ttf'),
    'Ubuntu-Regular': require('../assets/fonts/Ubuntu-Regular.ttf'),
    'Ubuntu-Bold': require('../assets/fonts/Ubuntu-Bold.ttf')
  });
  
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  /* ===================== FETCH SUBJECTS ===================== */
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get('/auth/subjects');
        setSubjects(response.data.subjects || []);
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
        Alert.alert('Error', 'Failed to fetch subjects');
      }
    };
    fetchSubjects();
  }, []);

  /* ===================== FETCH ASSIGNMENTS & SUBMISSIONS ===================== */
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!selectedSubject) {
        setAssignments([]);
        return;
      }
      try {
        const [assignmentResponse, submissionResponse] = await Promise.all([
          axios.get(
            `/auth/assignments?grade=${encodeURIComponent(currentUser.grade)}&subject=${encodeURIComponent(selectedSubject)}`
          ),
          axios.get(
            `/auth/submissions?userId=${currentUser._id}&subject=${encodeURIComponent(selectedSubject)}`
          )
        ]);
        
        const submissions = submissionResponse.data.submissions || [];
        
        const dataWithSubmissionFlag = (assignmentResponse.data || []).map(a => {
          // Use populated assignmentId to compare (ensure both are strings)
          const submission = submissions.find(
            s => s.assignmentId && s.assignmentId._id.toString() === a._id.toString()
          );
          if (submission) {
            return {
              ...a,
              isSubmitted: true,
              fileUploaded: true,
              filePath: submission.filePath,
              fileName: submission.fileName,
              fileType: submission.fileType,
            };
          } else {
            return {
              ...a,
              isSubmitted: false,
              fileUploaded: false,
              filePath: '',
              fileName: '',
              fileType: '',
            };
          }
        });
        
        setAssignments(dataWithSubmissionFlag);
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

  /* ===================== SELECT & SUBMIT LOGIC ===================== */
  const handleSelectAssignment = (assignmentId) => {
    setSelectedAssignmentId(prev => (prev === assignmentId ? null : assignmentId));
  };

  // Normal file picking for first-time submission
  const pickFileAndUpdate = async (assignmentId) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",  
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setAssignments(prev => prev.map(a => {
          if (a._id === assignmentId) {
            return {
              ...a,
              fileUploaded: true,
              filePath: asset.uri,
              fileName: asset.name,
              fileType: asset.mimeType || 'application/octet-stream',
            };
          }
          return a;
        }));
        Alert.alert('Success', `File "${asset.name}" uploaded! You can now submit.`);
      } else {
        Alert.alert('No file selected', 'You did not pick any file.');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Something went wrong picking the document.');
    }
  };

  // New function to pick a file and immediately resubmit (replace the old submission)
  const pickFileAndResubmit = async (assignmentId) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",  
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // Update file details in state and mark as not submitted yet.
        setAssignments(prev => prev.map(a => {
          if (a._id === assignmentId) {
            return {
              ...a,
              fileUploaded: true,
              filePath: asset.uri,
              fileName: asset.name,
              fileType: asset.mimeType || 'application/octet-stream',
              isSubmitted: false, // clear the submitted flag so that the Submit button shows
            };
          }
          return a;
        }));
        Alert.alert('Success', `File "${asset.name}" uploaded! Please press Submit to resubmit.`);
      } else {
        Alert.alert('No file selected', 'You did not pick any file.');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Something went wrong picking the document.');
    }
  };
  

  // Updated file upload handler to check for submission status and prompt for resubmission if needed
  const handleFileUpload = async (assignmentId) => {
    if (!assignmentId) {
      Alert.alert('No Assignment Selected', 'Please tap an assignment to select it first.');
      return;
    }
    const assignment = assignments.find(a => a._id === assignmentId);
    if (assignment && assignment.isSubmitted) {
      Alert.alert(
        'Assignment Already Submitted',
        'Would you like to resubmit assignment?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace',
            onPress: () => pickFileAndResubmit(assignmentId)
          }
        ]
      );
    } else {
      pickFileAndUpdate(assignmentId);
    }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    const assignment = assignments.find(a => a._id === assignmentId);
    if (!assignment) {
      Alert.alert('Error', 'Assignment not found in state.');
      return;
    }
    // For first-time submission only (resubmission is handled in file upload)
    submitOrReplace(assignmentId);
  };

  const submitOrReplace = async (assignmentId) => {
    const assignment = assignments.find(a => a._id === assignmentId);
    if (!assignment || !assignment.fileUploaded || !assignment.filePath) {
      Alert.alert('Error', 'No file is uploaded for this assignment.');
      return;
    }
    const payload = {
      assignmentId,
      userId: currentUser._id,
      filePath: assignment.filePath,
      fileName: assignment.fileName,
      fileType: assignment.fileType,
    };
    try {
      await axios.post('/auth/submit-assignment', payload);
      setAssignments(prev =>
        prev.map(a => {
          if (a._id === assignmentId) {
            return {
              ...a,
              isSubmitted: true,
            };
          }
          return a;
        })
      );
      Alert.alert('Success', assignment.isSubmitted ? 'Assignment resubmitted!' : 'Assignment submitted!');
    } catch (error) {
      console.error('Submission failed', error);
      Alert.alert('Error', 'Submission failed');
    }
  };

  /* ===================== RENDER ===================== */
  return (
    <ScrollView style={styles.screen} onLayout={onLayoutRootView}>
      <View style={styles.topHalf}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileContainer} onPress={() => navigation.navigate('Account')}>
          <Image source={{ uri: profilePicture }} style={styles.profileImage} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>My Assignments</Text>
        <Image
          source={require('../assets/logo7.png')}
          style={styles.bigIcon}
        />
        <Text style={styles.addAssignmentTitle}>Add Your Assignment</Text>
        <Text style={styles.addAssignmentSub}>
          Lorem ipsum dolor sit amet, adip iscing ipsum dolor sit amet, psum dolor sit amet.
        </Text>
        <View style={styles.iconsRow}>
          <TouchableOpacity style={styles.iconButton} onPress={() => handleFileUpload(selectedAssignmentId)}>
            <FontAwesome5 name="camera" size={24} color="#006446" />
            <Text style={styles.iconLabel}>Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => handleFileUpload(selectedAssignmentId)}>
            <FontAwesome5 name="file-pdf" size={24} color="#006446" />
            <Text style={styles.iconLabel}>PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => handleFileUpload(selectedAssignmentId)}>
            <FontAwesome5 name="file-word" size={24} color="#006446" />
            <Text style={styles.iconLabel}>Word</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => handleFileUpload(selectedAssignmentId)}>
            <FontAwesome5 name="image" size={24} color="#006446" />
            <Text style={styles.iconLabel}>Image</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.assignmentsHeader}>
        <Text style={styles.assignmentsHeaderText}>My Assignments</Text>
        <FontAwesome5 name="chevron-right" size={18} color="#006446" />
      </View>
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
      {assignments.length > 0 ? (
        assignments.map((assignment) => {
          const isSelected = assignment._id === selectedAssignmentId;
          return (
            <TouchableOpacity
              key={assignment._id}
              style={[
                styles.assignmentItem,
                isSelected && styles.assignmentItemSelected
              ]}
              onPress={() => handleSelectAssignment(assignment._id)}
            >
              <View style={styles.assignmentHeader}>
                <Text style={styles.assignmentTitle}>
                  {assignment.isSubmitted ? '✓ ' : ''}
                  {assignment.title}
                </Text>
              </View>
              <Text style={styles.assignmentDescription}>{assignment.description}</Text>
              <Text style={styles.assignmentMetaText}>Due Date: {assignment.dueDate}</Text>
              {isSelected && assignment.fileUploaded && (
                <Text style={styles.uploadedFileName}>
                  Uploaded File: {assignment.fileName}
                </Text>
              )}
              {isSelected && assignment.fileUploaded && !assignment.isSubmitted && (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => handleSubmitAssignment(assignment._id)}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              )}
              {assignment.isSubmitted && (
                <Text style={styles.submittedLabel}>Submitted</Text>
              )}
            </TouchableOpacity>
          );
        })
      ) : (
        <Text style={styles.noAssignmentsText}>
          No assignments found for the selected subject.
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E0E0E0',
  },
  topHalf: {
    width: 393,
    height: 128,
    backgroundColor: '#006446',
    alignSelf: 'center',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 59,
    left: 10,
    padding: 10,
    zIndex: 1,
  },
  profileContainer: {
    position: 'absolute',
    top: 57,
    right: 10,
    padding: 5,
    zIndex: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  pageTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Ubuntu-Bold',
    position: 'absolute',
    top: 10,
    left: 120,
    marginTop: 60,
  },
  bigIcon: {
    width: 70,
    height: 70,
    marginTop: 110,
    marginBottom: 0,
  },
  addAssignmentTitle: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
    color: '#106547',
    marginBottom: 4,
  },
  addAssignmentSub: {
    fontSize: 12,
    fontFamily: 'Ubuntu-Regular',
    color: '#414141',
    textAlign: 'center',
    marginBottom: 12,
  },
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  iconButton: {
    alignItems: 'center',
    padding: 5,
  },
  iconLabel: {
    fontSize: 11,
    fontFamily: 'Ubuntu-Regular',
    color: '#000000',
    marginTop: 3,
  },
  assignmentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    justifyContent: 'space-between',
  },
  assignmentsHeaderText: {
    fontSize: 18,
    fontFamily: 'Ubuntu-Bold',
    color: '#006446',
    marginTop: 180,
  },
  pickerWrapper: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 10,
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
    marginTop: 20,
    marginHorizontal: 20,
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
  assignmentItemSelected: {
    borderColor: '#006446',
    borderWidth: 2,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignmentTitle: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Regular',
    color: '#333333',
    flex: 1,
    marginRight: 10,
  },
  assignmentDescription: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Regular',
    color: '#555555',
    marginTop: 8,
    marginBottom: 8,
  },
  assignmentMetaText: {
    fontSize: 13,
    color: '#888',
    fontFamily: 'Ubuntu-Regular',
    marginBottom: 2,
  },
  uploadedFileName: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Regular',
    color: '#006446',
    marginTop: 5,
  },
  noAssignmentsText: {
    textAlign: 'center',
    color: '#AAAAAA',
    fontSize: 16,
    marginTop: 30,
    fontFamily: 'Ubuntu-Regular',
    paddingHorizontal: 20,
  },
  submitButton: {
    marginTop: 10,
    backgroundColor: '#006446',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontFamily: 'Ubuntu-Bold',
    fontSize: 14,
  },
  submittedLabel: {
    marginTop: 10,
    color: '#006446',
    fontFamily: 'Ubuntu-Bold',
    fontSize: 14,
  },
});

export default StudentAssignments;
