import React, { useState } from 'react';
import { View, Button, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

function AddTermScreen() {
  const [term, setTerm] = useState('Spring'); // Default to 'Spring' for better UX
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const [fontsLoaded] = useFonts({
    'kanitmedium': require('../assets/fonts/Kanit-Medium.ttf'),
  });

  const onLayoutRootView = React.useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const handleSubmit = async () => {
    const year = new Date().getFullYear(); // Get current year
    const termWithYear = `${term} ${year}`; // Combine term with year

    try {
      await axios.post('/auth/terms', {
        name: termWithYear,
        startDate: startDate.toISOString().split('T')[0], // Format as 'YYYY-MM-DD'
        endDate: endDate.toISOString().split('T')[0], // Format as 'YYYY-MM-DD'
      });
      Alert.alert("Success", "Term created successfully"); // Show success message
    } catch (error) {
      console.error('Error adding term:', error);
      Alert.alert("Error", "Failed to add term"); // Show error message
    }
  };

  const formatDate = (date) => date.toLocaleDateString();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <Text style={styles.heading}>Create Term</Text>
      <Text style={styles.label}>Select Term:</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={term} onValueChange={setTerm} style={styles.picker}>
          <Picker.Item label="Spring" value="Spring" />
          <Picker.Item label="Fall" value="Fall" />
          <Picker.Item label="Summer" value="Summer" />
        </Picker>
      </View>

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
    backgroundColor: '#f7f7f7',
  },
  heading: {
    fontSize: 24,
    fontFamily: 'kanitmedium',
    color: 'black',
    marginBottom: 50,
    marginLeft: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow for iOS
    shadowOpacity: 0.2, // Shadow for iOS
    shadowRadius: 3, // Shadow for iOS
  },
  picker: {
    width: '100%',
    
  },
  datePickerButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow for iOS
    shadowOpacity: 0.2, // Shadow for iOS
    shadowRadius: 3, // Shadow for iOS
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: 'black',
    borderRadius: 8,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow for iOS
    shadowOpacity: 0.2, // Shadow for iOS
    shadowRadius: 3, // Shadow for iOS
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddTermScreen;
