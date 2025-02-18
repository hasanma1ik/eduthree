import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import moment from 'moment';
import { AuthContext } from './context/authContext';

const features = [
  { id: '1', name: 'Attendance', icon: 'clipboard-list', route: 'StudentAttendance', color: 'maroon' }, 
  { id: '2', name: 'Announcements', icon: 'bullhorn', route: 'Announcements', color: '#1B5E20' }, 
  { id: '3', name: 'Assignments', icon: 'tasks', route: 'StudentAssignments', color: '#0D47A1' }, 
  { id: '4', name: 'Account', icon: 'user', route: 'Account', color: '#FF6600' }, 
  { id: '5', name: 'Class Schedule', icon: 'calendar-alt', route: 'ClassSchedule', color: '#002147' }, 
  { id: '6', name: 'Tuition Payment', icon: 'money-check-alt', route: 'PaymentScreen', color: '#006064' }, 
  { id: '7', name: 'Contact Us', icon: 'envelope', route: 'ContactUs', color: '#F9A825' }, 
];

const Home = () => {
  const navigation = useNavigation();
  const [latestPost, setLatestPost] = useState(null);

  // ✅ Get user info from AuthContext
  const [state] = useContext(AuthContext);
  const fullName = state?.user?.name || 'Student';
  const firstName = fullName.split(' ')[0]; // Extract first name

  const profilePicture = state?.user?.profilePicture || 
    'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png';


  // ✅ Fetch today's latest post
  const fetchLatestPost = async () => {
    try {
      const { data } = await axios.get('/post/get-all-post'); // Correct API route
      const today = moment().startOf('day'); 

      // Filter today's posts & sort by newest first
      const todaysPosts = data.posts
        .filter(post => moment(post.createdAt).isSameOrAfter(today))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setLatestPost(todaysPosts.length > 0 ? todaysPosts[0] : null);
    } catch (error) {
      console.error('Error fetching latest post:', error);
      Alert.alert('Error', 'Failed to fetch the latest post.');
    }
  };

  useEffect(() => {
    fetchLatestPost();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate(item.route)}
    >
      <View style={styles.iconContainer}>
        <Icon name={item.icon} size={20} color="#004d40" />
      </View>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardDescription}>Lorem ipsum dolor sit amet...</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, <Text style={styles.boldText}>{firstName}!</Text></Text>
          <Text style={styles.roleText}>🎓 Student</Text>
        </View>
       <TouchableOpacity onPress={() => navigation.navigate('Account')}>
                <Image source={{ uri: profilePicture }} style={styles.profileImage} />
              </TouchableOpacity>
      </View>

      {/* Alert Section */}
      <View style={styles.alertContainer}>
        <Text style={styles.alertTitle}>Today’s Alert</Text>
        {latestPost ? (
          <TouchableOpacity onPress={() => navigation.navigate('Announcements')}>
            <Text style={styles.alertText} numberOfLines={2}>
              {latestPost.description}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.noAlertText}>No alerts today</Text>
        )}
      </View>

      {/* Features Grid */}
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
    backgroundColor: '#f4f4f4',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    color: '#004d40',
    fontWeight: '400',
  },
  boldText: {
    fontWeight: 'bold',
  },
  roleText: {
    fontSize: 16,
    color: '#666',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  alertContainer: {
    backgroundColor: '#c8e6c9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004d40',
  },
  alertText: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  noAlertText: {
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  flatListContent: {
    justifyContent: 'center',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '47%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#e0f2f1',
    borderRadius: 50,
    padding: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004d40',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default Home;
