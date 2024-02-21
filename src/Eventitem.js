// EventItem.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EventItem = React.memo(({ item }) => (
  <View style={styles.item}>
    <Text style={styles.title}>{item.name}</Text>
    <Text>{`Date: ${item.date}`}</Text>
    <Text>{`Location: ${item.location}`}</Text>
    <Text>{`Description: ${item.description}`}</Text>
  </View>
));

const styles = StyleSheet.create({
  item: {
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EventItem;
