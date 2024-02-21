import React, { useState } from 'react';
import { View, Button, Text, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';

const AssignmentSubmission = () => {
  const [file, setFile] = useState(null);

  const selectFile = async () => {
    let result = await DocumentPicker.getDocumentAsync({});
    if (result.type === 'success') {
      setFile(result);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      Alert.alert('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: '*/*'
    });
    formData.append('assignmentId', 'ASSIGNMENT_ID_HERE');
    formData.append('studentId', 'STUDENT_ID_HERE');

    try {
      await axios.post('auth/submit-assignment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      Alert.alert('Success', 'Assignment submitted successfully');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to submit assignment');
    }
  };

  return (
    <View>
      <Button title="Select File" onPress={selectFile} />
      <Text>Selected File: {file ? file.name : 'None'}</Text>
      <Button title="Submit Assignment" onPress={handleSubmit} />
    </View>
  );
};

export default AssignmentSubmission;
