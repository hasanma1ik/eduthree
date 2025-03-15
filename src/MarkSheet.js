import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native';
import axios from 'axios';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { AuthContext } from './screen/context/authContext';

const MarkSheet = ({ route, navigation }) => {
  const { term, grade, subject, studentId, studentName, teacherName, existingReport } = route.params;
  const isReadOnly = !!existingReport;

  const [midTermMarks, setMidTermMarks] = useState(
    existingReport ? String(existingReport.midTermMarks) : ''
  );
  const [finalTermMarks, setFinalTermMarks] = useState(
    existingReport ? String(existingReport.finalTermMarks) : ''
  );
  const [comment, setComment] = useState(
    existingReport && existingReport.comment ? existingReport.comment : ''
  );
  const [loading, setLoading] = useState(false);

  const [state] = useContext(AuthContext);
  const { token } = state;

  // Helper function to either create or update marks
  const doSubmit = async (updateExisting, existingRecord = {}) => {
    try {
      const payload = {
        studentId,
        grade,
        subject, // This should be the subject _id
        term,
        midTermMarks: updateExisting
          ? Number(midTermMarks !== '' ? midTermMarks : existingRecord.midTermMarks)
          : Number(midTermMarks || 0),
        finalTermMarks: updateExisting
          ? Number(finalTermMarks !== '' ? finalTermMarks : existingRecord.finalTermMarks)
          : Number(finalTermMarks || 0),
        comment: updateExisting
          ? (comment !== '' ? comment : existingRecord.comment || '')
          : comment
      };

      let response;
      if (updateExisting) {
        // Update existing marks record
        response = await axios.put('/auth/marks', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Create new marks record
        response = await axios.post('/auth/marks', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (response.data.success) {
        Alert.alert('Success', response.data.message, [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert('Error', response.data.message || 'Submission failed');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message);
    }
  };

  // Main handler for Submit button
  const handleSubmitReport = async () => {
    if (isReadOnly) return; // If read-only, disallow changes

    // Check word limit
    const wordCount = comment.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 10) {
      Alert.alert('Error', 'Comments cannot exceed 10 words.');
      return;
    }

    setLoading(true);
    try {
      // Check if marks record already exists for the same student, grade, subject, term
      const checkResponse = await axios.get('/auth/marks', {
        params: {
          studentId,
          grade,
          subject,
          term,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(checkResponse.data) && checkResponse.data.length > 0) {
        const existing = checkResponse.data[0]; // existing record
        const updateMid = midTermMarks !== '' && Number(midTermMarks) !== existing.midTermMarks;
        const updateFinal = finalTermMarks !== '' && Number(finalTermMarks) !== existing.finalTermMarks && existing.finalTermMarks;
        
        if (updateMid || updateFinal) {
          Alert.alert(
            'Marks Already Submitted',
            `Existing mid-term marks: ${existing.midTermMarks}, final-term marks: ${existing.finalTermMarks}\n\nDo you want to update them?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Yes',
                onPress: () => doSubmit(true, existing),
              },
            ]
          );
        } else {
          // If record exists but only final marks or comment is changed, update directly
          doSubmit(true, existing);
        }
      } else {
        // No existing record, create new
        doSubmit(false);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <ScrollView contentContainerStyle={styles.container}>
       <View style={styles.topHalf}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>MarkSheet</Text>
      
      </View>

      <View style={styles.headerSection}>
        <Text style={styles.studentName}>{studentName}</Text>
        <Text style={styles.infoText}>Grade: {grade}</Text>
        <Text style={styles.infoText}>Subject: {subject}</Text>
        <Text style={styles.infoText}>Teacher: {teacherName}</Text>
        <Text style={styles.infoText}>Term: {term}</Text>
      </View>

      <View style={styles.marksSection}>
        <View style={styles.marksRow}>
          <Text style={styles.marksLabel}>Mid Term Marks:</Text>
          <TextInput
            style={[styles.marksInput, isReadOnly && styles.disabledInput]}
            placeholder="Not yet Entered"
            keyboardType="numeric"
            value={midTermMarks}
            onChangeText={setMidTermMarks}
            editable={!isReadOnly}
          />
        </View>
        <View style={styles.marksRow}>
          <Text style={styles.marksLabel}>Final Term Marks:</Text>
          <TextInput
            style={[styles.marksInput, isReadOnly && styles.disabledInput]}
            placeholder="Not yet Entered"
            keyboardType="numeric"
            value={finalTermMarks}
            onChangeText={setFinalTermMarks}
            editable={!isReadOnly}
          />
        </View>
        <View style={styles.marksRow}>
          <Text style={styles.marksLabel}>Comments:</Text>
          <TextInput
            style={[styles.marksInput, isReadOnly && styles.disabledInput]}
            placeholder="Not Yet Entered"
            value={comment}
            onChangeText={setComment}
            editable={!isReadOnly}
          />
        </View>
      </View>

      {!isReadOnly && (
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitReport}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit Marks'}
          </Text>
        </TouchableOpacity>
      )}
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
  pageTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Ubuntu-Bold',
  },
  headerSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  studentName: {
    fontSize: 26,
    fontFamily: 'Ubuntu-Bold',
    color: 'black',
    marginTop: 50,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Ubuntu-Regular',
    marginTop: 5,
  },
  marksSection: {
    marginBottom: 20,
  },
  marksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  marksLabel: {
    fontSize: 16,
    color: '#333',
    width: 150,
    fontFamily: 'Ubuntu-Regular'
  },
  marksInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F5F5F5',
  },
  disabledInput: {
    backgroundColor: '#EEE',
  },
  submitButton: {
    backgroundColor: '#006446',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Ubuntu-Bold',

  },
});

export default MarkSheet;
