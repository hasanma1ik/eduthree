import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import { Agenda } from 'react-native-calendars';

const CalendarScreen = () => {
  const [items, setItems] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('/auth/events');
        const fetchedEvents = response.data.events;
        const formattedItems = fetchedEvents.reduce((acc, current) => {
          const date = current.date.split('T')[0]; // Assuming date is in ISO format
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push({ name: current.name, ...current });
          return acc;
        }, {});
        setItems(formattedItems);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };
    fetchEvents();
  }, []);

  const renderItem = (item) => {
    return (
      <View style={styles.item}>
        <Text style={styles.title}>{item.name}</Text>
        <Text>{`Time: ${item.startTime} - ${item.endTime}`}</Text>
        <Text>{`Location: ${item.location}`}</Text>
        <Text>{`Description: ${item.description}`}</Text>
      </View>
    );
  };

  return (
    <Agenda
      items={items}
      renderItem={renderItem}
      theme={{
        agendaDayTextColor: 'green',
        agendaDayNumColor: 'green',
        agendaTodayColor: 'red',
        agendaKnobColor: 'blue',
      }}
    />
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: 'white',
    padding: 20,
    marginRight: 10,
    marginTop: 17,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CalendarScreen;








    /*     
    // CalendarScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import axios from 'axios';

const CalendarScreen = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Adjust the URL to match your backend endpoint
        const response = await axios.get('/auth/events');
        setEvents(response.data.events);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };
    fetchEvents();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>{item.name}</Text>
            <Text>{`Date: ${item.date}`}</Text>
            <Text>{`Location: ${item.location}`}</Text>
            <Text>{`Description: ${item.description}`}</Text>
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CalendarScreen;

    
    
    
    
    
    */