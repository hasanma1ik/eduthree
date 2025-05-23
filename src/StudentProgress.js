import React, { useContext, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Image 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { AuthContext } from './screen/context/authContext';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';

const StudentProgress = () => {
  const [state] = useContext(AuthContext);
  const { user, token } = state;
  const navigation = useNavigation();

  const [terms, setTerms] = useState([
    { name: 'Spring 2025', start: '2025-01-15', end: '2025-05-29' },
    { name: 'Fall 2024', start: '2024-09-01', end: '2024-12-15' },
    { name: 'Summer 2024', start: '2024-06-01', end: '2024-08-31' },
  ]);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = moment();
    const currentTerm = terms.find(term => {
      return today.isBetween(
        moment(term.start, 'YYYY-MM-DD'),
        moment(term.end, 'YYYY-MM-DD'),
        'day',
        '[]'
      );
    });
    if (currentTerm) {
      setSelectedTerm(currentTerm.name);
    } else {
      setSelectedTerm(terms[0]?.name || '');
    }
  }, [terms]);

  const handleShowReport = async () => {
    try {
      setLoading(true);
      // ⚡ Make an API request to check if the teacher has gone live
      const { data } = await axios.get(`/auth/check-live-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data?.isLive) {
        // ✅ If teacher has gone live, navigate to transcripts
        navigation.navigate('Transcripts', {
          term: selectedTerm,
          grade: user.grade,
          studentId: user._id,
          studentName: user.name,
          teacherName: '', 
        });
      } else {
        // ❌ If teacher has NOT gone live, show alert
        Alert.alert(
          "Not Available Yet",
          "Transcript will be available once your teacher goes live."
        );
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to check live status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.topHalf}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>My Progress Report</Text>
        <TouchableOpacity style={styles.profileContainer} onPress={() => navigation.navigate('Account')}>
          <Image
            source={{ uri: user?.profilePicture || 'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Term Dropdown */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Term:</Text>
        <Picker
          selectedValue={selectedTerm}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedTerm(itemValue)}
        >
          {terms.map((term, index) => (
            <Picker.Item key={index} label={term.name} value={term.name} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleShowReport}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.nextButtonText}>View My Transcript</Text>
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
    marginTop: 40,
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

export default StudentProgress;
