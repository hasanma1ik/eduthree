import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from './context/authContext';
import axios from 'axios';

const Post = ({ navigation }) => {
  const [state] = useContext(AuthContext);
  const currentUser = state.user;

  const [description, setDescription] = useState('');
  const [grades, setGrades] = useState([]);
  const [gradeSubjectMap, setGradeSubjectMap] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (currentUser.role === 'teacher') {
        try {
          const { data } = await axios.get(`/post/teacher/${currentUser._id}/data`);
          setGrades(data.grades || []);
          setGradeSubjectMap(data.gradeSubjectMap || {});
        } catch (error) {
          Alert.alert('Error', 'Failed to fetch grades and subjects.');
        }
      }
    };

    if (currentUser && currentUser.role === 'teacher') {
      fetchTeacherData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedGrade) {
      setSubjects(gradeSubjectMap[selectedGrade] || []);
    } else {
      setSubjects([]);
    }
    setSelectedSubject('');
  }, [selectedGrade, gradeSubjectMap]);

  const handlePost = async () => {
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please add a description.');
      return;
    }

    if (currentUser.role === 'teacher' && (!selectedGrade || !selectedSubject)) {
      Alert.alert('Validation Error', 'Please select a grade and subject.');
      return;
    }

    try {
      const postData = {
        description,
        grade: currentUser.role === 'teacher' ? selectedGrade : undefined,
        subject: currentUser.role === 'teacher' ? selectedSubject : undefined,
      };

      await axios.post('/post/create-post', postData);
      Alert.alert('Success', 'Post created successfully.');
      navigation.navigate('Announcements');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create post.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a Post</Text>

      <TextInput
        style={styles.textInput}
        placeholder="Write your post here..."
        placeholderTextColor="#aaa"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {currentUser && currentUser.role === 'teacher' && (
        <>
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Select Grade:</Text>
            <Picker
              selectedValue={selectedGrade}
              onValueChange={(value) => setSelectedGrade(value)}
              style={styles.picker}
            >
              <Picker.Item label="Select Grade" value="" />
              {grades.map((grade) => (
                <Picker.Item label={grade} value={grade} key={grade} />
              ))}
            </Picker>
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Select Subject:</Text>
            <Picker
              selectedValue={selectedSubject}
              onValueChange={(value) => setSelectedSubject(value)}
              style={styles.picker}
            >
              <Picker.Item label="Select Subject" value="" />
              {subjects.map((subject) => (
                <Picker.Item label={subject.name} value={subject._id} key={subject._id} />
              ))}
            </Picker>
          </View>
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handlePost}>
        <Text style={styles.buttonText}>Post</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F4F6F8',
  },
  title: {
    fontSize: 26,
    fontFamily: 'Kanit-Medium',
    color: '#34495E',
    textAlign: 'center',
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
    color: '#333',
    marginBottom: 20,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
    color: '#34495E',
    marginBottom: 8,
  },
  picker: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50', // Green button
    borderRadius: 8,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Kanit-Medium',
  },
});

export default Post;
