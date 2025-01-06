import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

function AddTermScreen() {
  const [term, setTerm] = useState('Spring');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const [fontsLoaded] = useFonts({
    'Kanit-Medium': require('../assets/fonts/Kanit-Medium.ttf'),
  });

  const onLayoutRootView = React.useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const handleSubmit = async () => {
    const year = new Date().getFullYear();
    const termWithYear = `${term} ${year}`;

    try {
      await axios.post('/auth/terms', {
        name: termWithYear,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });
      Alert.alert("Success", "Term created successfully");
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
      <Text style={styles.heading}></Text>

      {/* Term Picker */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Select Term:</Text>
        <RNPickerSelect
          onValueChange={(value) => setTerm(value)}
          items={[
            { label: "Spring", value: "Spring" },
            { label: "Fall", value: "Fall" },
            { label: "Summer", value: "Summer" },
          ]}
          placeholder={{ label: 'Select a term', value: null }}
          style={pickerSelectStyles}
          useNativeAndroidPickerStyle={false}
          Icon={() => <Text style={styles.icon}>▼</Text>}
          value={term}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F4F6F8',
  },
  heading: {
    fontSize: 26,
    fontFamily: 'Kanit-Medium',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
    color: '#34495E',
    marginBottom: 8,
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
    fontFamily: 'Kanit-Medium',
  },
  submitButton: {
    backgroundColor: '#018749',
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
    fontFamily: 'Kanit-Medium',
  },
  icon: {
    color: '#2C3E50',
    fontSize: 18,
    paddingRight: 10,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 8,
    color: '#34495E',
    backgroundColor: '#FFF',
    paddingRight: 30,
    fontFamily: 'Kanit-Medium',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    color: '#34495E',
    backgroundColor: '#FFF',
    paddingRight: 30,
    fontFamily: 'Kanit-Medium',
  },
  placeholder: {
    color: '#999',
    fontFamily: 'Kanit-Medium',
  },
});

export default AddTermScreen;
