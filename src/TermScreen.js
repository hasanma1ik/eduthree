import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  Text, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useNavigation } from '@react-navigation/native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { TextInput } from 'react-native';

function AddTermScreen() {
  const [term, setTerm] = useState(''); // Initially blank for manual entry
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const [fontsLoaded] = useFonts({
    'Ubuntu-Bold': require('../assets/fonts/Ubuntu-Bold.ttf'),
  });

  const navigation = useNavigation();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const handleSubmit = async () => {
    const year = new Date().getFullYear();
     const termWithYear = /\d{4}/.test(term) ? term : `${term} ${year}`;

    try {
      await axios.post('/auth/terms', {
        name: termWithYear,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });
      Alert.alert("Success", "Term created successfully", [
           {
             text: "OK",
             onPress: () => {
               navigation.replace('AddTermScreen');
             },
            },
          ]);
    } catch (error) {
      console.error('Error adding term:', error);
      Alert.alert("Error", "Failed to add term");
    }
  };

  const formatDate = (date) => date.toLocaleDateString();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      {/* Custom Header */}
      <View style={styles.topHalf}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Add Term</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Term Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Term Name:</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter term name"
            placeholderTextColor="#999"
            value={term}
            onChangeText={setTerm}
          />
        </View>

        {/* Start Date Picker */}
        <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>Start Date: {formatDate(startDate)}</Text>
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(Platform.OS === 'ios');
              setStartDate(selectedDate || startDate);
            }}
          />
        )}

        {/* End Date Picker */}
        <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>End Date: {formatDate(endDate)}</Text>
        </TouchableOpacity>
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(Platform.OS === 'ios');
              setEndDate(selectedDate || endDate);
            }}
          />
        )}

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Add Term</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  scrollContainer: {
    padding: 20,
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
  pageTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Ubuntu-Bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
    color: '#34495E',
    marginBottom: 8,
  },
  textInput: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    color: '#34495E',
  },
  datePickerButton: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'black',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  datePickerText: {
    fontSize: 16,
    color: '#34495E',
    fontFamily: 'Ubuntu-Bold',
  },
  submitButton: {
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
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Ubuntu-Bold',
  },
});

export default AddTermScreen;
