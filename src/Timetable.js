// TimetableScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import axios from 'axios';

const TimetableScreen = ({ route }) => {
  const [timetable, setTimetable] = useState([]);
  const { userId } = route.params; // Assuming you're navigating with params

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
       
        const response = await axios.get(`/auth/timetable/${userId}`);
        setTimetable(response.data.timetableEntries);
      } catch (error) {
        console.log("Failed to fetch timetable:", error);
      }
    };

    fetchTimetable();
  }, [userId]);

  return (
    <View style={styles.container}>
      <FlatList
        data={timetable}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.subject}>{item.subject}</Text>
            <Text>{`${item.days.join(", ")}: ${item.startTime} - ${item.endTime}`}</Text>
            <Text>{`Location: ${item.location}`}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 22,
  },
  item: {
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  subject: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TimetableScreen;
