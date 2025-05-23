import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';

const AttendanceScreen = () => {
  const [fontsLoaded] = useFonts({
    'kanitregular': require('../assets/fonts/Kanit-Medium.ttf'),
    'kanitmedium1': require('../assets/fonts/Kanit-Regular.ttf'),
    'Ubuntu-Bold': require('../assets/fonts/Ubuntu-Bold.ttf'),
  });

  const navigation = useNavigation();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      {/* Custom Header */}
      <View style={styles.topHalf}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Attendance</Text>
      </View>
      
      {/* Rest of the content */}
      <TouchableOpacity
        style={[styles.button, styles.takeAttendanceButton]}
        onPress={() => navigation.navigate('TakeAttendance')}
      >
        <Text style={styles.buttonText}>Take Attendance</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.seeAttendanceButton]}
        onPress={() => navigation.navigate('SeeAttendance')}
      >
        <Text style={styles.buttonText}>See Attendance</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  topHalf: {
    width: 393,
    height: 128,
    backgroundColor: '#006446',
    alignSelf: 'center',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 10,
    marginTop: 35,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 59,
    left: 10,
    padding: 10,
    zIndex: 1,
  },
  pageTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Ubuntu-Bold',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 2,
    width: 250,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  takeAttendanceButton: {
    backgroundColor: '#006446',
    marginTop: 200,
    marginLeft: 60,
  },
  seeAttendanceButton: {
    backgroundColor: '#006446',
    marginLeft: 60,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Ubuntu-Bold',
  },
});

export default AttendanceScreen;




























// import React, { useState, useEffect } from 'react';
// import { View, Button, StyleSheet, Alert, Text, ScrollView, Platform } from 'react-native';
// import axios from 'axios';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { Picker } from '@react-native-picker/picker';

// const AttendanceScreen = () => {
//   const [grades, setGrades] = useState(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8']);
//   const [selectedGrade, setSelectedGrade] = useState('');
//   const [subjects, setSubjects] = useState([]);
//   const [selectedSubject, setSelectedSubject] = useState('');
//   const [users, setUsers] = useState([]);
//   const [userAttendance, setUserAttendance] = useState({});
//   const [date, setDate] = useState(new Date());
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   const onChangeDate = (event, selectedDate) => {
//     const currentDate = selectedDate || date;
//     setShowDatePicker(Platform.OS === 'ios');
//     setDate(currentDate);
//   };

//   const showDatepicker = () => {
//     setShowDatePicker(true);
//   };

//   useEffect(() => {
//     fetchSubjects();
//   }, []);

//   useEffect(() => {
//     if (selectedGrade && selectedSubject) {
//       fetchUsersByGradeAndSubject();
//     }
//   }, [selectedGrade, selectedSubject]);

//   const fetchUsersByGradeAndSubject = async () => {
//     try {
//       const response = await axios.get(`/auth/class/grade/${selectedGrade}/subject/${selectedSubject}/users`);
//       setUsers(response.data);
//       // Reset userAttendance whenever users are fetched
//       const initialAttendance = response.data.reduce((acc, user) => ({ ...acc, [user._id]: '' }), {});
//       setUserAttendance(initialAttendance);
//     } catch (error) {
//       console.error(`Failed to fetch users:`, error);
//       Alert.alert("Error", `Failed to fetch users`);
//     }
//   };

//   const fetchSubjects = async () => {
//     try {
//       const response = await axios.get('/auth/subjects');
//       setSubjects(response.data.subjects);
//     } catch (error) {
//       console.error('Failed to fetch subjects:', error);
//       Alert.alert("Error", "Failed to fetch subjects");
//     }
//   };

//   const handleAttendanceChange = (userId, status) => {
//     setUserAttendance(prevState => ({ ...prevState, [userId]: status }));
//   };

//   const formatDate = (date) => {
//     return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
//   };


//   return (

    
//     <View style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollView}>
//         <View style={styles.datePickerContainer}>
//           <Button onPress={showDatepicker} title="Select Date" />
//           <Text style={styles.dateText}>Selected Date: {formatDate(date)}</Text>
//           {showDatePicker && (
//             <DateTimePicker
//               testID="dateTimePicker"
//               value={date}
//               mode="date"
//               is24Hour={true}
//               display="default"
//               onChange={onChangeDate}
//             />
//           )}
//         </View>

//         <Text style={styles.headerText}>Select a Grade:</Text>
//         <View style={styles.pickerContainer}>
//           <Picker
//             selectedValue={selectedGrade}
//             onValueChange={(itemValue) => setSelectedGrade(itemValue)}
//             style={styles.picker}
//           >
//             <Picker.Item label="Select a grade" value="" />
//             {grades.map((grade) => (
//               <Picker.Item key={grade} label={grade} value={grade} />
//             ))}
//           </Picker>
//         </View>

//         <Text style={styles.headerText}>Select a Subject:</Text>
//         <View style={styles.pickerContainer}>
//           <Picker
//             selectedValue={selectedSubject}
//             onValueChange={(itemValue) => setSelectedSubject(itemValue)}
//             style={styles.picker}
//           >
//             <Picker.Item label="Select a subject" value="" />
//             {subjects.map((subject) => (
//               <Picker.Item key={subject._id} label={subject.name} value={subject._id} />
//             ))}
//           </Picker>
//         </View>

//         {users.map((user) => (
//           <View key={user._id} style={styles.userContainer}>
//             <Text style={styles.userName}>{user.name}</Text>
//             <Picker
//               selectedValue={userAttendance[user._id]}
//               onValueChange={(itemValue) => handleAttendanceChange(user._id, itemValue)}
//               style={styles.attendancePicker}
//             >
//               <Picker.Item label="Select Status" value="" />
//               <Picker.Item label="Present" value="Present" />
//               <Picker.Item label="Absent" value="Absent" />
//               <Picker.Item label="Late" value="Late" />
//             </Picker>
//           </View>
//         ))}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: 10,
//   },
//   scrollView: {
//     alignItems: 'center',
//   },
//   pickerContainer: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     marginBottom: 20,
//     width: '90%',
//     backgroundColor: '#fafafa',
//   },
//   picker: {
//     width: '100%',
//   },
//   headerText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   userContainer: {
//     marginTop: 10,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 10,
//     width: '90%',
//     backgroundColor: '#fff',
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   userName: {
//     fontSize: 16,
//     marginBottom: 5,
//   },
//   attendancePicker: {
//     width: '100%',
//     marginBottom: 10,
//   },
//   datePickerContainer: {
//     margin: 20,
//     padding: 10,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//   },
// });

// export default AttendanceScreen;
