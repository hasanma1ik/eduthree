import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import { AuthContext } from './screen/context/authContext';

const objectives = [
  'Is Enthusiastic and Resourceful Learner',
  'Self-Disciplined and Resolves Difficulties in mature ways',
  'Enjoys excellent relationship with peers and teachers',
  'Is Genuine, empathetic and respectful towards others',
  'Punctual to school and lessons',
  'Contributes actively to school and wider community',
  'Exhibits excellent work ethic, is creative and leads with confidence',
];

const options = ['Often', 'Sometimes', 'Rarely'];

const GrowthReport = ({ route, navigation }) => {
  const { term, grade, subject, studentId, studentName, teacherName, existingReport } = route.params;
  const isReadOnly = !!existingReport;
  const [state] = useContext(AuthContext);
  const { token } = state;

  // Initial objectiveRatings is an object mapping each objective to { mid, final }
  const [objectiveRatings, setObjectiveRatings] = useState(
    existingReport
      ? existingReport.personalDevelopment.reduce((acc, obj) => {
          acc[obj.objective] = { mid: obj.midTermRating, final: obj.finalTermRating };
          return acc;
        }, {})
      : {}
  );

  const handleRatingChange = (objective, field, value) => {
    if (isReadOnly) return;
    setObjectiveRatings(prev => ({
      ...prev,
      [objective]: {
        ...(prev[objective] || {}),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    // Check if either all mid-term answers or all final-term answers are provided.
    const allMidFilled = objectives.every(obj => {
      return objectiveRatings[obj] && objectiveRatings[obj].mid && objectiveRatings[obj].mid !== '';
    });
    const allFinalFilled = objectives.every(obj => {
      return objectiveRatings[obj] && objectiveRatings[obj].final && objectiveRatings[obj].final !== '';
    });

    if (!allMidFilled && !allFinalFilled) {
      Alert.alert(
        'Incomplete Submission',
        'Please fill all answers for either mid term or final term.'
      );
      return;
    }

    // Transform objectiveRatings object into an array matching your model format.
    const personalDevelopment = Object.entries(objectiveRatings).map(
      ([objective, ratings]) => ({
        objective,
        midTermRating: ratings.mid || '',
        finalTermRating: ratings.final || ''
      })
    );

    try {
      const payload = {
        studentId,
        grade,
        subject,  // Ensure this is a valid subject id (not a name)
        term,
        personalDevelopment
      };

      const response = await axios.post('/auth/growthreports', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        Alert.alert(
          'Growth Report Submitted',
          'Personal and Social Development section has been submitted.'
        );
        // Optionally navigate back or reset state.
      } else {
        Alert.alert('Error', response.data.message || 'Submission failed');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.studentName}>{studentName}</Text>
        <Text style={styles.infoText}>Grade: {grade}</Text>
        {/* <Text style={styles.infoText}>Subject: {subject}</Text> */}
        <Text style={styles.infoText}>Teacher: {teacherName}</Text>
        <Text style={styles.infoText}>Term: {term}</Text>
      </View>

      <View style={styles.objectivesSection}>
        {/* <Text style={styles.sectionHeader}>Growth Report</Text> */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.objectiveColumn]}>Objective</Text>
          <Text style={[styles.tableCell, styles.marksColumn]}>Mid Term</Text>
          <Text style={[styles.tableCell, styles.marksColumn]}>Final Term</Text>
        </View>
        {objectives.map((objective, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.objectiveColumn]}>{objective}</Text>
            <View style={[styles.tableCell, styles.marksColumn]}>
              <RNPickerSelect
                useNativeAndroidPickerStyle={false}
                onValueChange={(value) => handleRatingChange(objective, 'mid', value)}
                value={objectiveRatings[objective]?.mid || ''}
                placeholder={{ label: 'Select', value: '' }}
                items={[
                  { label: 'Select', value: '' },
                  ...options.map(option => ({ label: option, value: option }))
                ]}
                disabled={isReadOnly}
                style={{
                  inputAndroid: {
                    fontSize: 13,
                    color: '#333',
                    paddingVertical: 8,
                    paddingHorizontal: 10
                  },
                  inputIOS: {
                    fontSize: 16,
                    color: '#333',
                    paddingVertical: 8,
                    paddingHorizontal: 10
                  }
                }}
              />
            </View>
            <View style={[styles.tableCell, styles.marksColumn]}>
              <RNPickerSelect
                useNativeAndroidPickerStyle={false}
                onValueChange={(value) => handleRatingChange(objective, 'final', value)}
                value={objectiveRatings[objective]?.final || ''}
                placeholder={{ label: 'Select', value: '' }}
                items={[
                  { label: 'Select', value: '' },
                  ...options.map(option => ({ label: option, value: option }))
                ]}
                disabled={isReadOnly}
                style={{
                  inputAndroid: {
                    fontSize: 13,
                    color: '#333',
                    paddingVertical: 8,
                    paddingHorizontal: 10
                  },
                  inputIOS: {
                    fontSize: 16,
                    color: '#333',
                    paddingVertical: 8,
                    paddingHorizontal: 10
                  }
                }}
              />
            </View>
          </View>
        ))}
      </View>

      {!isReadOnly && (
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Growth Report</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff'
  },
  headerSection: {
    marginBottom: 20,
    alignItems: 'center'
  },
  studentName: {
    fontSize: 26,
    marginTop: 20,
    // fontWeight: 'bold',
    color: '#006446',
    fontFamily: 'Ubuntu-Bold'
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Ubuntu-Regular',
    marginTop: 5
  },
  objectivesSection: {
    marginBottom: 20
  },
  // sectionHeader: {
  //   fontSize: 18,
  //   fontFamily: 'Ubuntu-Bold',
  //   color: '#006446',
  //   marginBottom: 10,
  //   textAlign: 'center'
  // },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E0E0E0',
    paddingVertical: 10,
    paddingHorizontal: 5
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderColor: '#DDD'
  },
  tableCell: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Regular',
    color: '#333'
  },
  objectiveColumn: {
    flex: 2
  },
  marksColumn: {
    flex: 1
  },
  submitButton: {
    backgroundColor: '#006446',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Ubuntu-Bold'
  }
});

export default GrowthReport;
