import React, { useContext, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  ScrollView, 
  TextInput, 
  Image 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { AuthContext } from './screen/context/authContext';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';

const PND = () => {
  const [state] = useContext(AuthContext);
  const { user, token } = state;
  const navigation = useNavigation();

  // Teacher data from backend (grades and gradeSubjectMap)
  const [teacherGrades, setTeacherGrades] = useState([]);
  const [gradeSubjectMap, setGradeSubjectMap] = useState({});

  // Sample terms array – in a real app, these might come from your backend
  const [terms, setTerms] = useState([
    { name: 'Spring 2025', start: '2025-01-15', end: '2025-05-29' },
    { name: 'Fall 2024', start: '2024-09-01', end: '2024-12-15' },
    { name: 'Summer 2024', start: '2024-06-01', end: '2024-08-31' },
  ]);
  const [selectedTerm, setSelectedTerm] = useState('');

  // Local selections
  const [selectedGrade, setSelectedGrade] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');

  // For searchable student dropdown
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  const [loading, setLoading] = useState(false);

  // Fetch teacher data (grades and gradeSubjectMap)
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const response = await axios.get(`/auth/teacher/${user._id}/data`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data) {
          // Sort grades numerically (e.g. "Grade 1", "Grade 2", etc.)
          const sortedGrades = (response.data.grades || []).sort((a, b) => {
            const numA = parseInt(a.replace(/[^0-9]/g, ''), 10);
            const numB = parseInt(b.replace(/[^0-9]/g, ''), 10);
            return numA - numB;
          });
          setTeacherGrades(sortedGrades);
          setGradeSubjectMap(response.data.gradeSubjectMap || {});
          if (sortedGrades.length > 0) setSelectedGrade(sortedGrades[0]);
        }
      } catch (error) {
        console.error('Failed to fetch teacher data:', error);
        Alert.alert('Error', 'Failed to fetch teacher data');
      }
    };
    fetchTeacherData();
  }, [user, token]);

  // Determine current term based on today’s date
  useEffect(() => {
    const today = moment();
    const currentTerm = terms.find(term =>
      today.isBetween(
        moment(term.start, 'YYYY-MM-DD'),
        moment(term.end, 'YYYY-MM-DD'),
        'day',
        '[]'
      )
    );
    if (currentTerm) {
      setSelectedTerm(currentTerm.name);
    } else {
      setSelectedTerm(terms[0]?.name || '');
    }
  }, [terms]);

  // Warn if a non-current term is selected
  const handleTermChange = (newTerm) => {
    const today = moment();
    const currentTerm = terms.find(term =>
      today.isBetween(moment(term.start, 'YYYY-MM-DD'), moment(term.end, 'YYYY-MM-DD'), 'day', '[]')
    );
    if (currentTerm && currentTerm.name !== newTerm) {
      Alert.alert(
        'Warning',
        `Are you sure you want to select ${newTerm} as your current term?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK', onPress: () => setSelectedTerm(newTerm) }
        ]
      );
    } else {
      setSelectedTerm(newTerm);
    }
  };

  // Fetch students by grade
  useEffect(() => {
    if (selectedGrade) {
      const fetchStudents = async () => {
        try {
          setLoading(true);
          // Call backend route: GET /auth/class/grade/:grade/users
          const response = await axios.get(`/auth/class/grade/${selectedGrade}/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const fetchedStudents = response.data || [];
          setStudents(fetchedStudents);
          if (fetchedStudents.length > 0) {
            const found = fetchedStudents.find(s => s._id === selectedStudent);
            if (!found) {
              setSelectedStudent(fetchedStudents[0]._id);
            }
          } else {
            setSelectedStudent('');
          }
          setLoading(false);
        } catch (error) {
          console.error(`Failed to fetch users for grade ${selectedGrade}:`, error);
          setLoading(false);
          Alert.alert('Error', `Failed to fetch users for this grade`);
        }
      };
      fetchStudents();
    } else {
      setStudents([]);
      setSelectedStudent('');
    }
  }, [selectedGrade, token]);

  // Filter students by search term
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Navigate to Student Progress Report page on button click
  const handleShowReport = () => {
    navigation.navigate('GrowthReport', {
      term: selectedTerm,
      grade: selectedGrade,
      studentId: selectedStudent,
      studentName: students.find(u => u._id === selectedStudent)?.name || '',
      teacherName: user.name,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Custom Header */}
      <View style={styles.topHalf}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Growth Report</Text>
        <TouchableOpacity style={styles.profileContainer} onPress={() => navigation.navigate('Account')}>
          <Image
            source={{ uri: user?.profilePicture || 'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Term Dropdown */}
      <View style={styles.pickerContainer1}>
        <Text style={styles.label}>Select Term:</Text>
        <Picker
          selectedValue={selectedTerm}
          style={styles.picker}
          onValueChange={(itemValue) => handleTermChange(itemValue)}
        >
          {terms.map((term, index) => (
            <Picker.Item key={index} label={term.name} value={term.name} />
          ))}
        </Picker>
      </View>

      {/* Grade Dropdown */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Grade:</Text>
        <Picker
          selectedValue={selectedGrade}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedGrade(itemValue)}
        >
          {teacherGrades.map((grade, index) => (
            <Picker.Item key={index} label={grade} value={grade} />
          ))}
        </Picker>
      </View>

      {/* Searchable Student Dropdown */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Student:</Text>
        <TouchableOpacity
          style={styles.searchBox}
          onPress={() => setShowStudentDropdown(!showStudentDropdown)}
        >
          <Text style={styles.searchText}>
            {students.find(u => u._id === selectedStudent)?.name || 'Select student'}
          </Text>
        </TouchableOpacity>
        {showStudentDropdown && (
          <View style={styles.dropdownContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search students..."
              onChangeText={setStudentSearch}
              value={studentSearch}
            />
            <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
              {filteredStudents.map(item => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedStudent(item._id);
                    setStudentSearch('');
                    setShowStudentDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleShowReport}
        disabled={loading || !selectedStudent || !selectedGrade || !selectedTerm}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.nextButtonText}>Fill Report</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  // Custom Header Styles (same as in Assignments)
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
  pickerContainer: {
    marginBottom: 15,
  },
  pickerContainer1: {
    marginTop: 25,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
    color: '#333',
    marginBottom: 5,
  },
  picker: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchBox: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
  },
  searchText: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
    color: '#333',
  },
  dropdownContainer: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 150,
  },
  searchInput: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#DDD',
  },
  dropdownList: {
    maxHeight: 120,
  },
  dropdownItem: {
    padding: 10,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
    color: '#333',
  },
  nextButton: {
    backgroundColor: '#006446',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Ubuntu-Bold',
  },
});

export default PND;
