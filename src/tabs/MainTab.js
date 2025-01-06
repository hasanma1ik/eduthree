import { View, Text, StyleSheet } from 'react-native';
import React, { useContext, useCallback } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Home from '../screen/Home';
import Icon from 'react-native-vector-icons/FontAwesome5';
import LoginPage from '../LoginPage';
import RegisterScreen from '../screen/RegisterScreen';
import handleForgetPassword  from '../screen/forgetpasswordscreen';
import ContactUs from '../screen/ContactUs';
import { AuthContext } from '../screen/context/authContext';
import TopTab from './TopTab';
import Post from '../screen/Post';
import About from '../screen/About';
import Account from '../screen/Account';
import MyPosts from '../screen/MyPosts';
import { DrawerContent } from '../DrawerContent';
import Messages from '../screen/Messages';
import ChatScreen from '../screen/ChatScreen';
import AttendanceScreen from '../AttendanceScreen';
import TimetableScreen from '../ClassSchedule';
import Assignments from '../Assignments';
import CreateAssignment from '../createAssignment';
import CreateClasses from '../CreateClasses';
import StudentForm from '../studentform';
import GradeSetter from '../gradesetter';
import PaymentScreen from '../screen/PaymentScreen';
import TakeAttendance from '../TakeAttendance';
import SeeAttendanceScreen from '../SeeAttendance';
import NotificationsScreen from '../screen/Notifications';
import ClassSchedule from '../ClassSchedule';
import AddTermScreen from '../TermScreen';
import PostDetail from '../PostDetail';
import { Image } from 'react-native'
import { useFonts } from 'expo-font';
import TeacherHome from '../screen/teacherhome';
import AdminHome from '../screen/adminhome';
import Announcements from '../screen/announcements';
import StudentAttendance from '../screen/studentattendance';
import StudentAssignments from '../studentassignments';



const MainTab = () => {
  const [state] = useContext(AuthContext);
  const authenticatedUser = state?.user && state?.token;
  const userRole = state?.user?.role;

  const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const [fontsLoaded] = useFonts({
  'merriweather-sans': require('../../assets/fonts/MerriweatherSans-VariableFont_wght.ttf'),
  'BebasNeue': require('../../assets/fonts/BebasNeue-Regular.ttf')
});

const onLayoutRootView = useCallback(async () => {
  if (fontsLoaded) {
    await SplashScreen.hideAsync();
  }
}, [fontsLoaded]);

if (!fontsLoaded) {
  return null;
}



  const TeacherStackNavigator = () => (
      <Stack.Navigator initialRouteName="Home">
          {/* Teacher specific screens */}
          <Stack.Screen
      name="Home"
      component={TeacherHome}
      options={{
        headerTitle: () => (
          <View style={styles.headerContainer}>
            <Icon name="home" size={24} color="black" style={styles.homeIcon} />
            <Text style={styles.headerText}>Home</Text>
          </View>
        ),
        headerStyle: { backgroundColor: 'white' },
        headerTintColor: 'black',
      }}
    />
    <Stack.Screen name="Post" component={Post} options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Post',
    headerTintColor: 'black',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    }
  }}
/> 
    <Stack.Screen name="Messages" component={Messages} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="About" component={About} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Account" component={Account} options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Account',
    headerTintColor: 'black',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    }
  }}
/> 
<Stack.Screen name="Announcements" component={Announcements} options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Announcements',
    headerTintColor: 'black',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    }
  }}
/> 



    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{
    headerStyle: { backgroundColor: 'black' },
    title: 'Notifications',
    headerTintColor: 'white',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'white' 
    }
  }}
/> 

    <Stack.Screen name="PostDetail" component={PostDetail} options={{ title: 'Post Detail' }} />

    <Stack.Screen name="MyPosts" component={MyPosts} options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'My Posts', headerTintColor: 'black', headerBackTitle: 'Back', headerRight:()=> <TopTab />,   headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    } }} /> 
    <Stack.Screen name="AttendanceScreen" component={AttendanceScreen} options={{
    headerStyle: { backgroundColor: 'white' },
    title: '',
    headerTintColor: 'black',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    
  }}
/>
<Stack.Screen
  name="ContactUs"
  component={ContactUs}
  options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Contact Us',
    headerTintColor: 'black',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    }
  }}
/> 
    <Stack.Screen name="TakeAttendance" component={TakeAttendance}  options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Take Attendance',
    headerTintColor: 'black',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    }
  }}
/> 
    <Stack.Screen name="SeeAttendance" component={SeeAttendanceScreen} options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'See Attendance', headerTintColor: 'black', headerBackTitle: 'Back', headerRight:()=> <TopTab />,   headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    } }} />  
    <Stack.Screen name="ClassSchedule" component={ClassSchedule}options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Class Schedule',
    headerTintColor: 'black',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    }
  }}
/> 
    

    <Stack.Screen name="TimetableScreen" component={TimetableScreen} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
    {/* <Stack.Screen name="CalendarScreen" component={CalendarScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> */}
      <Stack.Screen name="ChatScreen" component={ChatScreen} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="Assignments" component={Assignments} options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Your Assignments',
    headerTintColor: 'black',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    }
  }}
/> 
      <Stack.Screen name="CreateAssignment" component={CreateAssignment} options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Create Assignment',
    headerTintColor: 'black',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    }
  }}
/> 
      <Stack.Screen name="CreateClasses" component={CreateClasses} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
      {/* <Stack.Screen name="ClassesScreen" component={ClassesScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> */}
      <Stack.Screen name="StudentForm" component={StudentForm} options={{
    headerStyle: { backgroundColor: 'black' },
    title: 'Student Enrollment',
    headerTintColor: 'white',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'white' 
    }
    
  }}
/>
      <Stack.Screen name="GradeSetter" component={GradeSetter} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />

      </Stack.Navigator>
  );

  const StudentStackNavigator = () => (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          headerTitle: () => (
            <View style={styles.headerContainer}>
              <Icon name="home" size={24} color="black" style={styles.homeIcon} />
              <Text style={styles.headerText}>Home</Text>
            </View>
          ),
          headerStyle: { backgroundColor: 'white' },
          headerTintColor: 'black',
        }}
      />
          <Stack.Screen name="PostDetail" component={PostDetail} options={{ title: 'Post Detail' }} />
          <Stack.Screen name="Messages" component={Messages} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{
    headerStyle: { backgroundColor: 'black' },
    title: 'Notifications',
    headerTintColor: 'white',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'white' 
    }
  }}
/> 
<Stack.Screen name="Announcements" component={Announcements} options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Announcements',
    headerTintColor: 'black',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    }
  }}
/> 

    <Stack.Screen name="Account" component={Account} options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Account',
    headerTintColor: 'black',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    }
  }}
/> 

<Stack.Screen name="PaymentScreen" component={PaymentScreen} options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Payment Portal',
    headerTintColor: 'black',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    }
  }}
/> 
<Stack.Screen name="StudentAttendance" component={StudentAttendance} options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Student Attendance',
    headerTintColor: 'black',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    }
  }}
/> 
    <Stack.Screen name="ClassSchedule" component={ClassSchedule}  options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Class Schedule',
    headerTintColor: 'black',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    }
  }}
/> 
<Stack.Screen
  name="ContactUs"
  component={ContactUs}
  options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Contact Us',
    headerTintColor: 'black',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    }
  }}
/> 
      <Stack.Screen name="StudentAssignments" component={StudentAssignments} options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Your Assignments',
    headerTintColor: 'black',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    }
  }}
/> 
      

          {/* Repeat for common screens like About, Account, etc. */}
      </Stack.Navigator>
  );

  const AdminStackNavigator = () => (
    <Stack.Navigator initialRouteName="Home">
        {/* Student specific screens */}
        <Stack.Screen
      name="Home"
      component={AdminHome}
      options={{
        headerTitle: () => (
          <View style={styles.headerContainer}>
            <Icon name="home" size={24} color="black" style={styles.homeIcon} />
            <Text style={styles.headerText}>Home</Text>
          </View>
        ),
        headerStyle: { backgroundColor: 'white' },
        headerTintColor: 'black',
      }}
    />
        <Stack.Screen name="Post" component={Post} options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Post',
    headerTintColor: 'black',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    }
  }}
/> 
        <Stack.Screen name="Messages" component={Messages} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
  <Stack.Screen name="Notifications" component={NotificationsScreen} options={{
    headerStyle: { backgroundColor: 'black' },
    title: 'Notifications',
    headerTintColor: 'white',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'white' 
    }
  }}
/> 
  <Stack.Screen
  name="Account"
  component={Account}
  options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Account',
    headerTintColor: 'black',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    }
  }}
/> 

<Stack.Screen
  name="ContactUs"
  component={ContactUs}
  options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Contact Us',
    headerTintColor: 'black',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    }
  }}
/> 
<Stack.Screen name="Announcements" component={Announcements} options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Announcements',
    headerTintColor: 'black',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    }
  }}
/> 



  <Stack.Screen name="PostDetail" component={PostDetail} options={{ title: 'Post Detail' }} />


  <Stack.Screen name="MyPosts" component={MyPosts} options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'My Posts', headerTintColor: 'black', headerBackTitle: 'Back', headerRight:()=> <TopTab />,   headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    } }} /> 
 <Stack.Screen 
  name="CreateClasses" 
  component={CreateClasses} 
  options={{ 
    headerStyle: { backgroundColor: 'white' }, 
    headerTintColor: 'black',  
    title: 'Course Creation', 
    headerBackTitle: 'Back', 
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: '#018749' 
    }
  }} 
/>


    <Stack.Screen name="StudentForm" component={StudentForm} options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Student Form',
    headerTintColor: 'black',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    }
    
  }}
/>
      <Stack.Screen name="GradeSetter" component={GradeSetter} options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Assign Grade', headerTintColor: 'black', headerBackTitle: 'Back', headerRight:()=> <TopTab />,   headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    } }} /> 
      <Stack.Screen name="AttendanceScreen" component={AttendanceScreen}  options={{
    headerStyle: { backgroundColor: 'black' },
    title: '',
    headerTintColor: 'white',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    
  }}
/>
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} options={{
    headerStyle: { backgroundColor: 'black' },
    title: 'Payment Portal',
    headerTintColor: 'white',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'white' 
    }
  }}
/> 
      <Stack.Screen name="TakeAttendance" component={TakeAttendance}  options={{
    headerStyle: { backgroundColor: 'black' },
    title: 'Take Attendance',
    headerTintColor: 'white',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'white' 
    }
  }}
/> 
    <Stack.Screen name="SeeAttendance" component={SeeAttendanceScreen} options={{
    headerStyle: { backgroundColor: 'black' },
    title: 'See Attendance', headerTintColor: 'white', headerBackTitle: 'Back', headerRight:()=> <TopTab />,   headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'white' 
    } }} /> 
    <Stack.Screen name="AddTermScreen" component={AddTermScreen} options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Create Term', headerTintColor: 'black', headerBackTitle: 'Back', headerRight:()=> <TopTab />,   headerRight: () => <TopTab />,
    headerTitleAlign: 'center', // Center-aligns the title
    headerTitleStyle: { 
      fontFamily: 'Kanit-Medium', 
      fontSize: 22, 
      color: 'black' 
    } }} /> 
   

        {/* Repeat for common screens like About, Account, etc. */}
    </Stack.Navigator>
);

  const AuthenticationStackNavigator = () => (
      <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }}  />
          <Stack.Screen name="Register" component={RegisterScreen} />
         
    <Stack.Screen name="ForgetPassword" component={handleForgetPassword } options={{ headerShown: false }} />


      </Stack.Navigator>
  );

  return (
    <>
      {authenticatedUser ? (
        <Drawer.Navigator drawerContent={(props) => <DrawerContent {...props} />}>
          {userRole === 'teacher' ? (
            <Drawer.Screen
              name="Faculty Portal"
              component={TeacherStackNavigator}
              options={{
                headerTitle: () => (
                  <View style={styles.headerContainer}>
                    <Image
                      source={require('./../../assets/lalogo.jpg')}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                    <Text style={styles.headerText}>Faculty Portal</Text>
                  </View>
                ),
                headerStyle: { backgroundColor: 'white' },
                headerTintColor: 'black',
              }}
            />
          ) : userRole === 'admin' ? (
            <Drawer.Screen
              name="Admin Portal"
              component={AdminStackNavigator}
              options={{
                headerTitle: () => (
                  <View style={styles.headerContainer}>
                    <Image
                      source={require('./../../assets/lalogo.jpg')}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                    <Text style={styles.headerText}>Admin Portal</Text>
                  </View>
                ),
                headerStyle: { backgroundColor: 'white' },
                headerTintColor: 'black',
              }}
            />
          ) : (
            <Drawer.Screen
              name="Student Portal"
              component={StudentStackNavigator}
              options={{
                headerTitle: () => (
                  <View style={styles.headerContainer}>
                    <Image
                      source={require('./../../assets/lalogo.jpg')}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                    <Text style={styles.headerText}>Student Portal</Text>
                  </View>
                ),
                headerStyle: { backgroundColor: 'white' },
                headerTintColor: 'black',
              }}
            />
          )}
        </Drawer.Navigator>
      ) : (
        <AuthenticationStackNavigator />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 40,
    marginRight: 10,
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'BebasNeue',
    color: 'black',
  },
  homeIcon: {
    marginRight: 10,
  },
});

export default MainTab;