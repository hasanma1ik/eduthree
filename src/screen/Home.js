import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const features = [
  { id: '1', name: 'Attendance', icon: 'clipboard-list', route: 'StudentAttendance', color: 'maroon' }, // Dark Orange
  { id: '2', name: 'Announcements', icon: 'bullhorn', route: 'Announcements', color: '#1B5E20' }, // Dark Green
  { id: '3', name: 'Assignments', icon: 'tasks', route: 'StudentAssignments', color: '#0D47A1' }, // Dark Blue
  { id: '4', name: 'Account', icon: 'file-alt', route: 'Account', color: '#FF6600' }, // Dark Amber
  { id: '5', name: 'Class Schedule', icon: 'calendar-alt', route: 'ClassSchedule', color: '#002147' }, // Dark Purple
  { id: '6', name: 'Tuition Payment', icon: 'money-check-alt', route: 'PaymentScreen', color: '#006064' }, // Dark Cyan
  { id: '7', name: 'Contact Us', icon: 'envelope', route: 'ContactUs', color: '#F9A825' }, // Dark Yellow
];


const Home = () => {
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: item.color }]}
      onPress={() => navigation.navigate(item.route)}
    >
      <Icon name={item.icon} size={40} color="white" />
      <Text style={styles.cardText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={features}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0E0E0', // Light gray background
    padding: 10,
  },
  flatListContent: {
    justifyContent: 'center',
    paddingVertical: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '45%', // Cards will take up 45% of the row
    paddingVertical: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cardText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
    // fontWeight: 'bold',
    fontFamily: 'Kanit-Medium',
    textAlign: 'center',
  },
});

export default Home;

