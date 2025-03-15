import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Alert, 
  Text, 
  TouchableOpacity 
} from 'react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AuthContext } from './screen/context/authContext';
import { useNotifications } from '../NotificationContext';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Picker } from '@react-native-picker/picker';
import { Image } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';

const CreateAssignment = () => {
  const [state, setState] = useContext(AuthContext);
  const currentUser = state.user;
  const navigation = useNavigation();

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
  const [gradeSubjectMap, setGradeSubjectMap] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { updateNotificationCount, notificationCount } = useNotifications();

  const [fontsLoaded] = useFonts({
    'Ubuntu-Bold': require('../assets/fonts/Ubuntu-Bold.ttf'),
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
        console.log("Teacher Data Response:", response.data);
        setGrades(response.data.grades);
        setGradeSubjectMap(response.data.gradeSubjectMap);
      } catch (error) {
        console.error('Failed to fetch teacher data:', error);
        Alert.alert("Error", "Failed to fetch teacher data");
      }
    };
    fetchTeacherData();
  }, [currentUser]);

  useEffect(() => {
    if (grade && gradeSubjectMap[grade]) {
      setSubjects(gradeSubjectMap[grade]);
      console.log(`Subjects for Grade ${grade}:`, gradeSubjectMap[grade]);
    } else {
      setSubjects([]);
      console.log(`No subjects found for Grade ${grade}`);
    }
    setSubject(''); // Reset subject when grade changes
  }, [grade, gradeSubjectMap]);

  const handleCreate = async () => {
    if (
      title.trim() === '' ||
      description.trim() === '' ||
      grade === '' ||
      subject === ''
    ) {
      Alert.alert('Validation Error', 'Please fill all fields');
      return;
    }

    try {
      const formattedDueDate = `${dueDate.getFullYear()}-${('0' + (dueDate.getMonth() + 1)).slice(-2)}-${('0' + dueDate.getDate()).slice(-2)}`;
      console.log("Creating Assignment with Data:", {
        title,
        description,
        dueDate: formattedDueDate,
        grade,
        subject,
      });

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

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    const currentDate = selectedDate || dueDate;
    setDueDate(currentDate);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Custom Header */}
      <View style={styles.topHalf}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Create Assignment</Text>
        <TouchableOpacity style={styles.profileContainer} onPress={() => navigation.navigate('Account')}>
          <Image
            source={{ uri: currentUser?.profilePicture || 'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        style={{ backgroundColor: 'black' }}
        resetScrollToCoords={{ x: 0, y: 0 }}
        contentContainerStyle={styles.container}
        onLayout={onLayoutRootView}
      >
        {/* Grade Picker */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Grade:</Text>
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              onValueChange={(value) => setGrade(value)}
              items={grades.map((grade) => {
                if (typeof grade === 'object') {
                  return { label: grade.name || grade.toString(), value: grade.value || grade._id };
                }
                return { label: grade.toString(), value: grade };
              })}
              placeholder={{ label: 'Select Grade', value: null }}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
              Icon={() => <Text style={styles.icon}>▼</Text>}
              value={grade}
            />
          </View>
        </View>

        {/* Subject Picker */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Subject:</Text>
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              onValueChange={(value) => setSubject(value)}
              items={subjects.map((subject) => {
                if (typeof subject === 'object') {
                  return { label: subject.name || subject.toString(), value: subject._id || subject.value };
                }
                return { label: subject.toString(), value: subject };
              })}
              placeholder={{ label: 'Select Subject', value: null }}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
              Icon={() => <Text style={styles.icon}>▼</Text>}
              value={subject}
            />
          </View>
        </View>

        {/* Title Input */}
        <TextInput
          placeholder="Title"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        {/* Description Input */}
        <TextInput
          placeholder="Description"
          placeholderTextColor="#888"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textArea]}
          multiline={true}
        />

        {/* Date Picker Button */}
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
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

        {/* Display Due Date */}
        <Text style={styles.dueDateText}>Due Date: {dueDate.toISOString().split('T')[0]}</Text>

        {/* Create Assignment Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Text style={styles.createButtonText}>Create Assignment</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F9F9F9',
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
    justifyContent: 'center',
    position: 'relative',
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
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 5,
  },
  pickerWrapper: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'white',
    backgroundColor: '#333333',
    marginBottom: 10,
    overflow: 'hidden',
  },
  icon: {
    color: 'black',
    fontSize: 18,
    paddingRight: 10,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: 'black',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 10,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    backgroundColor: '#006446',
    paddingVertical: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  datePickerButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
  },
  dueDateText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 10,
  },
  createButton: {
    backgroundColor: '#006446',
    borderRadius: 8,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    color: 'white',
    backgroundColor: '#333333',
    paddingRight: 30,
    fontFamily: 'Ubuntu-Bold',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    color: 'black',
    backgroundColor: 'white',
    paddingRight: 30,
    fontFamily: 'Ubuntu-Bold',
  },
  placeholder: {
    color: 'black',
    fontFamily: 'Ubuntu-Bold',
  },
});

export default CreateAssignment;
