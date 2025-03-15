import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Image 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from './context/authContext';
import axios from 'axios';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

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
      {/* Custom Header */}
      <View style={styles.topHalf}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Create a Post</Text>
        <TouchableOpacity style={styles.profileContainer} onPress={() => navigation.navigate('Account')}>
          <Image
            source={{ uri: currentUser?.profilePicture || 'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  topHalf: {
    width: '100%',
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
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Ubuntu-Bold',
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
    color: '#333',
    marginBottom: 20,
    height: 150,
    textAlignVertical: 'top',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pickerContainer: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    padding: 10,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
    color: '#34495E',
    marginBottom: 8,
  },
  picker: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#006446',
    borderRadius: 8,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Ubuntu-Bold',
  },
});

export default Post;
