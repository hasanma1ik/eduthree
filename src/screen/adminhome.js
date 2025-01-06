// AdminHome.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const features = [
  { id: '1', name: 'Course Creation', icon: 'book-open', route: 'CreateClasses', color: 'maroon' },
  { id: '2', name: 'Announcements', icon: 'bullhorn', route: 'Announcements', color: '#1B5E20' },
  { id: '3', name: 'Grade Setter', icon: 'graduation-cap', route: 'GradeSetter', color: '#0D47A1' },
  { id: '4', name: 'Create Term', icon: 'calendar-plus', route: 'AddTermScreen', color: '#FF6600' },
  { id: '5', name: 'Student Enrollment', icon: 'user-plus', route: 'StudentForm', color: '#002147' },
  { id: '6', name: 'Post', icon: 'user-plus', route: 'Post', color: '#006064' },
  { id: '7', name: 'My Posts', icon: 'pen', route: 'MyPosts', color: 'black' },
  { id: '8', name: 'Contact Us', icon: 'envelope', route: 'ContactUs', color: '#F9A825' },
];

const AdminHome = () => {
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
      {/* <Text style={styles.title}>Admin Portal</Text> */}
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
  // Same styles as your Home component
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
    fontFamily: 'Kanit-Medium',
    textAlign: 'center',
  },
});

export default AdminHome;
