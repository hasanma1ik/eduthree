import React, { useContext, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import moment from 'moment';
import { AuthContext } from './context/authContext';

const features = [
  {
    id: '1',
    name: 'Course Creation',
    icon: 'book-open',
    route: 'CreateClasses',
    color: 'maroon',
    description: 'Create classes with days & times.',
  },
  {
    id: '2',
    name: 'Grade Setter',
    icon: 'graduation-cap',
    route: 'GradeSetter',
    color: '#0D47A1',
    description: 'Assign students to grade & section.',
  },
  {
    id: '3',
    name: 'Create Term',
    icon: 'calendar-plus',
    route: 'AddTermScreen',
    color: '#FF6600',
    description: 'Add or manage academic terms.',
  },
  {
    id: '4',
    name: 'Enroll Students',
    icon: 'user-plus',
    route: 'StudentForm',
    color: '#002147',
    description: 'Enroll students in class subjects.',
  },
  {
    id: '5',
    name: 'Add Users',
    icon: 'user-cog',
    route: 'AddUsers',
    color: '#4B0082',
    description: 'Create teacher, student, admin accounts.',
  },
  {
    id: '6',
    name: 'Manage Users',
    icon: 'users',
    route: 'AdminUsersList',
    color: '#006446',
    description: 'Browse, filter, and manage users.',
  },
  {
  id: '7',
  name: 'Section Assignments',
  icon: 'layer-group',         // FontAwesome5
  route: 'SectionAssignments', // your new screen
  color: '#2E7D32',
  description: 'Map sections to terms/batches.',
},
{ id: '8', name: 'All Classes', icon: 'chalkboard-teacher', route: 'AdminClasses', color: '#0B6EFD', description: 'Browse, filter, and manage classes.' },

];

const AdminHome = () => {
  const navigation = useNavigation();
  const [latestPost, setLatestPost] = useState(null);
  const [state] = useContext(AuthContext);

  const fullName = state?.user?.name || 'Admin';
  const firstName = fullName.split(' ')[0];

  const profilePicture =
    state?.user?.profilePicture ||
    'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png';

  // Fetch today's latest post
  const fetchLatestPost = async () => {
    try {
      const { data } = await axios.get('/post/get-all-post');
      const today = moment().startOf('day');
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
      <View style={[styles.iconContainer, { backgroundColor: '#e0f2f1' }]}>
        <Icon name={item.icon} size={20} color="#004d40" />
      </View>
      <Text
        style={styles.cardTitle}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {item.name}
      </Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      {/* Full-width Header Wrapper */}
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, <Text style={styles.boldText}>{firstName}</Text>
            </Text>
            <Text style={styles.roleText}>🎓 Admin</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Account')}>
            <Image source={{ uri: profilePicture }} style={styles.profileImage} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.container}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerWrapper: {
    width: 393,
    height: 162,
    backgroundColor: '#006446',
    alignSelf: 'center',
    paddingHorizontal: 30,
    paddingVertical: 27,
    marginTop: 36,
    marginBottom: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 35,
  },
  greeting: { fontSize: 22, color: '#fff', fontFamily: 'Ubuntu-Regular' },
  boldText: { fontFamily: 'Ubuntu-Bold' },
  roleText: { fontSize: 16, color: '#fff', fontFamily: 'Ubuntu-Regular' },
  profileImage: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#fff' },

  alertContainer: { backgroundColor: '#c8e6c9', borderRadius: 12, padding: 15, marginBottom: 20 },
  alertTitle: { fontSize: 20, fontFamily: 'Ubuntu-Bold', color: '#004d40' },
  alertText: { fontSize: 14, color: '#333', marginTop: 5, fontFamily: 'Ubuntu-Light' },
  noAlertText: { fontSize: 14, color: '#777', fontStyle: 'italic', textAlign: 'center', fontFamily: 'Ubuntu-Light' },

  flatListContent: { justifyContent: 'center' },
  row: { justifyContent: 'space-between', marginBottom: 20 },

  card: {
    width: '47%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
  },
  iconContainer: { borderRadius: 50, padding: 10, marginBottom: 10 },
  cardTitle: { fontSize: 18, fontFamily: 'Ubuntu-Bold', color: '#004d40' },
  cardDescription: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 5, fontFamily: 'Ubuntu-Light' },
});

export default AdminHome;
