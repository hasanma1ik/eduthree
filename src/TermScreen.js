import React, { useState } from 'react';
import { View, Button, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

function AddTermScreen() {
  const [term, setTerm] = useState('Spring'); // Default to 'Spring' for better UX
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

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

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Term:</Text>
      <Picker selectedValue={term} onValueChange={setTerm} style={styles.picker}>
        <Picker.Item label="Spring" value="Spring" />
        <Picker.Item label="Fall" value="Fall" />
        <Picker.Item label="Summer" value="Summer" />
      </Picker>

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

      <Button title="Add Term" onPress={handleSubmit} color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  picker: {
    marginBottom: 20,
  },
  datePickerButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  datePickerText: {
    fontSize: 16,
  },
});

export default AddTermScreen;
