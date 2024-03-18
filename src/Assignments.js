import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get('/auth/assignments'); // Adjust URL as needed
        // Update state with fetched assignments
        setAssignments(response.data);
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
        Alert.alert("Error", "Failed to fetch assignments");
      }
    };
  
    fetchAssignments();
  }, []);
  
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Your Assignments</Text>
      {assignments.length > 0 ? (
        assignments.map((assignment, index) => (
          <View key={index} style={styles.assignmentItem}>
            <Text style={styles.assignmentTitle}>{assignment.title}</Text>
            <Text>{assignment.description}</Text>
            <Text>Due Date: {assignment.dueDate}</Text>
          </View>
        ))
      ) : (
        <Text>No assignments found for your subjects.</Text>
      )}
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  assignmentItem: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Assignments;
