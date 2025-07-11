import React, { useContext, useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { AuthContext } from './screen/context/authContext';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';

const Results = () => {
  const [state] = useContext(AuthContext);
  const { user, token } = state;
  const navigation = useNavigation();

  const [teacherGrades, setTeacherGrades] = useState([]);
  const [terms, setTerms] = useState([
    { name: 'Spring 2025', start: '2025-01-15', end: '2025-05-29' },
    { name: 'Fall 2024', start: '2024-09-01', end: '2024-12-15' },
    { name: 'Summer 2024', start: '2024-06-01', end: '2024-08-31' },
  ]);

  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const res = await axios.get(`/auth/teacher/${user._id}/data`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sortedGrades = (res.data.grades || []).sort((a, b) =>
          parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, ''))
        );
        setTeacherGrades(sortedGrades);
        if (sortedGrades.length > 0) setSelectedGrade(sortedGrades[0]);
      } catch (err) {
        Alert.alert('Error', 'Could not fetch teacher data');
      }
    };
    fetchTeacherData();
  }, []);

  useEffect(() => {
    const today = moment();
    const current = terms.find(term =>
      today.isBetween(moment(term.start), moment(term.end), 'day', '[]')
    );
    setSelectedTerm(current?.name || terms[0]?.name || '');
  }, [terms]);

  useEffect(() => {
    if (!selectedGrade) return;
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/auth/class/grade/${selectedGrade}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(data || []);
        if (data.length > 0) setSelectedStudent(data[0]._id);
        setLoading(false);
      } catch (err) {
        Alert.alert('Error', 'Could not fetch students');
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedGrade]);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleShowReport = () => {
    if (!selectedStudent || !selectedGrade || !selectedTerm) {
      return Alert.alert('Missing Fields', 'Please select all fields first.');
    }
    navigation.navigate('Transcripts', {
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
        <Text style={styles.pageTitle}>Progress Reports</Text>
        <TouchableOpacity style={styles.profileContainer} onPress={() => navigation.navigate('Account')}>
          <Image
            source={{ uri: user?.profilePicture || 'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Term Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Term:</Text>
        <Picker
          selectedValue={selectedTerm}
          style={styles.picker}
          onValueChange={setSelectedTerm}
        >
          {terms.map((term, index) => (
            <Picker.Item key={index} label={term.name} value={term.name} />
          ))}
        </Picker>
      </View>

      {/* Grade Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Grade:</Text>
        <Picker
          selectedValue={selectedGrade}
          style={styles.picker}
          onValueChange={setSelectedGrade}
        >
          {teacherGrades.map((grade, idx) => (
            <Picker.Item key={idx} label={grade} value={grade} />
          ))}
        </Picker>
      </View>

      {/* Search + Dropdown */}
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
            <ScrollView style={styles.dropdownList} nestedScrollEnabled>
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

      {/* Submit */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleShowReport}
        disabled={loading || !selectedStudent}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.nextButtonText}>Show Transcript</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
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
    marginTop: 20,
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
    width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#fff',
  },
  pageTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Ubuntu-Bold',
  },
  pickerContainer: {
    marginTop: 20,
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
    marginTop: 30,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Ubuntu-Bold',
  },
});

export default Results;
