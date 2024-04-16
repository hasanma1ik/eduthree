import React, { useState, useEffect, useContext } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { UserContext } from './screen/context/userContext';
import { useNotifications } from '../NotificationContext';

const CreateAssignment = () => {

  const { currentUser } = useContext(UserContext);
  
  // Early return if not a teacher
  // if (currentUser.role !== 'teacher') {
  //   return <Text>You must be a teacher to create assignments.</Text>;
  // }
  const initialState = {
    title: '',
    description: '',
    dueDate: new Date(),
    grade: '',
    subject: '',
  };

  const [title, setTitle] = useState(initialState.title);
  const [description, setDescription] = useState(initialState.description);
  const [dueDate, setDueDate] = useState(initialState.dueDate);
  const [grade, setGrade] = useState(initialState.grade);
  const [subject, setSubject] = useState(initialState.subject);
  const [grades, setGrades] = useState(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8']);
  const [subjects, setSubjects] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get('/auth/subjects');
        setSubjects(response.data.subjects);
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
        Alert.alert("Error", "Failed to fetch subjects");
      }
    };
    fetchSubjects();
  }, []);


  const { updateNotificationCount, notificationCount } = useNotifications();

  const handleCreate = async () => {
    try {
      const formattedDueDate = `${dueDate.getFullYear()}-${('0' + (dueDate.getMonth() + 1)).slice(-2)}-${('0' + dueDate.getDate()).slice(-2)}`;
      await axios.post('/auth/create-assignments', {
        title,
        description,
        dueDate: formattedDueDate,
        grade,
        subject,
      });
      Alert.alert("Success", "Assignment created successfully");
      updateNotificationCount(notificationCount + 1)
      // Reset state to initial after successful creation
      setTitle(initialState.title);
      setDescription(initialState.description);
      setDueDate(initialState.dueDate);
      setGrade(initialState.grade);
      setSubject(initialState.subject);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to create assignment");
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    const currentDate = selectedDate || dueDate; // Fallback to dueDate if selectedDate is undefined
    setDueDate(currentDate);
  };


  return (
    <KeyboardAwareScrollView style={{ backgroundColor: '#EAEAEA' }} resetScrollToCoords={{ x: 0, y: 0 }} contentContainerStyle={styles.container}>
      <Text style={styles.header}>Create New Assignment</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Grade:</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={grade} onValueChange={setGrade} style={styles.picker}>
            <Picker.Item label="Select Grade" value="" />
            {grades.map((grade, index) => <Picker.Item key={index} label={grade} value={grade} />)}
          </Picker>
        </View>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Subject:</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={subject} onValueChange={setSubject} style={styles.picker}>
            <Picker.Item label="Select Subject" value="" />
            {subjects.map((subject, index) => <Picker.Item key={index} label={subject.name} value={subject._id} />)}
          </Picker>
        </View>
      </View>
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.textArea]}
        multiline={true}
      />
      <View style={styles.datePickerButton}>
        <Button title="Select Due Date" onPress={() => setShowDatePicker(true)} color="#007AFF" />
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}
      <Text style={styles.dueDateText}>Due Date: {dueDate.toISOString().split('T')[0]}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Create Assignment" onPress={handleCreate} color="#4CAF50" />
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#EAEAEA',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  picker: {
    backgroundColor: '#fff',
  },
  datePickerButton: {
    marginBottom: 10,
  },
  dueDateText: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 10,
  },
});

export default CreateAssignment;
