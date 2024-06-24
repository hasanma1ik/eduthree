import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, TextInput, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { UserContext } from './screen/context/userContext';
import { useNotifications } from '../NotificationContext';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

const CreateAssignment = () => {

  //currentUser is obtained from UserContext, which holds the currently logged-in user's information.
  const { currentUser } = useContext(UserContext);

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
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

 
//Fetching Teacher Data
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const response = await axios.get(`/auth/teacher/${currentUser._id}/data`);
        console.log(response.data); // Log the response data
        setGrades(response.data.grades);
        setSubjects(response.data.subjects);
      } catch (error) {
        console.error('Failed to fetch teacher data:', error);
        Alert.alert("Error", "Failed to fetch teacher data");
      }
    };
    fetchTeacherData();
  }, [currentUser]);

  //updates notification count upon assignment creation

  const { updateNotificationCount, notificationCount } = useNotifications();


  //Assignment creation
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
      updateNotificationCount(notificationCount + 1);
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

  //Handling Date Change:

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    const currentDate = selectedDate || dueDate;
    setDueDate(currentDate);
  };

  const [fontsLoaded] = useFonts({
    'kanitmedium': require('../assets/fonts/Kanit-Medium.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAwareScrollView style={{ backgroundColor: '#F7F7F7' }} resetScrollToCoords={{ x: 0, y: 0 }} contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Create Assignment</Text>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Grade:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={grade}
            onValueChange={(itemValue) => setGrade(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Grade" value="" />
            {grades.map((grade, index) => (
              <Picker.Item key={index} label={grade} value={grade} />
            ))}
          </Picker>
        </View>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Subject:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={subject}
            onValueChange={(itemValue) => setSubject(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Subject" value="" />
            {subjects.map((subject, index) => (
              <Picker.Item key={index} label={subject} value={subject} />
            ))}
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
      <TouchableOpacity style={[styles.datePickerButton, styles.blackButton]} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.datePickerButtonText}>Select Due Date</Text>
      </TouchableOpacity>
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
        <TouchableOpacity style={[styles.createButton, styles.blackButton]} onPress={handleCreate}>
          <Text style={styles.createButtonText}>Create Assignment</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F7F7F7',
  },
  headerContainer: {
    alignItems: 'flex-start',
  },
  header: {
    fontSize: 24,
    fontFamily: 'kanitmedium',
    color: 'black',
    marginBottom: 20,
    marginTop: -20,
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
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  picker: {
    backgroundColor: '#fff',
  },
  datePickerButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 2,
    width: '100%',
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  blackButton: {
    backgroundColor: 'maroon',
  },
  datePickerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dueDateText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  buttonContainer: {
    marginTop: 10,
  },
  createButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 2,
    width: '100%',
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateAssignment;
