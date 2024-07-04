import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const StyledNotificationMessage = ({ message }) => {
  const { subject, assignment, due } = JSON.parse(message);

  return (
    <View>
      <Text style={styles.subjectStyle}>{subject}</Text>
      <Text style={styles.assignmentStyle}>{assignment}</Text>
      <Text style={styles.dueStyle}>{due}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  subjectStyle: {
    color: 'blue',
    fontSize: 16,
  },
  assignmentStyle: {
    color: 'black',
    fontSize: 16,
  },
  dueStyle: {
    color: 'red',
    fontSize: 16,
  }
});

export default StyledNotificationMessage;
