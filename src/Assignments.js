import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';


const Assignments = ({ route }) => {
  const { assignmentId } = route.params;
  const [assignment, setAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await axios.get(`auth/assignments/${assignmentId}`);
        setAssignment(response.data);
      } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        Alert.alert("Error", error.response ? error.response.data.message : "Failed to fetch assignment details");
      }
    };
    fetchAssignment();
  }, [assignmentId]);

  const selectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // or specific MIME type
      });
  
      if (result.canceled) {
        console.log('Document selection was cancelled.');
        Alert.alert('Cancelled', 'Document selection was cancelled.');
        return;
      }
  
      console.log('Selected file', result);
      // Assuming you're interested in the first selected file
      const selectedFile = result.assets ? result.assets[0] : null;
      if (selectedFile) {
        setFile(selectedFile);
      } else {
        Alert.alert('Error', 'No file selected');
      }
    } catch (err) {
      console.error('Error picking document:', err);
      Alert.alert('Error', 'An error occurred while picking the document.');
    }
  };
  

  const uploadFile = async () => {
    if (!file) {
      Alert.alert("Error", "Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: '*/*', // or the actual type of the file
    });

    setUploading(true);

    try {
      const response = await axios.post('auth/upload', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploading(false);
      Alert.alert("Upload Successful", `File uploaded successfully: ${response.data.filePath}`);
      // You can now use response.data.filePath in your assignment submission
    } catch (err) {
      setUploading(false);
      Alert.alert("Upload Failed", "The file upload failed.");
      console.error(err);
    }
  };

  // This function now just alerts the user to upload a file
  const handleSubmit = async () => {
    if (!file) {
      Alert.alert("Error", "Please upload a file first");
      return;
    }

    // Upload the file first
  await uploadFile(); // Make sure this function sets the fileUrl state upon success

  // Check if the file URL is set
  if (!fileUrl) {
    Alert.alert("Error", "File upload failed or no file URL available");
    return;
  }
  
    // Assuming studentId is obtained from your auth context or passed in some way
    const studentId = 'YOUR_STUDENT_ID'; // Replace this with actual logic to obtain studentId
  
    try {
      // Prepare the submission data
      const submissionData = {
        assignmentId: assignmentId,
      studentId: studentId,
      fileUrl: fileUrl, // Use the file URL obtained from the upload process
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      };
  
      // Send a POST request to your backend endpoint
      const response = await axios.post('/auth/submission', submissionData);
  
      // Check the response status and act accordingly
      if (response.status === 201) {
        Alert.alert("Success", "Assignment submitted successfully.");
      } else {
        // Handle any other status codes as needed
        Alert.alert("Error", "Failed to submit assignment.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to submit assignment: " + error.message);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{assignment ? assignment.name : 'Loading...'}</Text>
      <Button title="Select File" onPress={selectFile} />
      {file && <Text>File selected: {file.name}</Text>}
      <Button title={uploading ? "Uploading..." : "Upload File"} onPress={uploadFile} disabled={uploading} />
      <Button title="Submit Assignment" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default Assignments;