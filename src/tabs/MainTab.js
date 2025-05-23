import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
import BottomTab from './bottomTab';
import Grades from '../Grades';

import Results from '../Results';
import PND from '../P&D';
import GrowthReport from '../GrowthReport';
import MarkSheet from '../MarkSheet';
import Transcript from '../Transcripts';
import StudentProgress from '../StudentProgress';




const MainTab = () => {
  const [state] = useContext(AuthContext);
  const authenticatedUser = state?.user && state?.token;
  const userRole = state?.user?.role;

  const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const [fontsLoaded] = useFonts({
  'merriweather-sans': require('../../assets/fonts/MerriweatherSans-VariableFont_wght.ttf'),
  'BebasNeue': require('../../assets/fonts/BebasNeue-Regular.ttf'),
  'Kanit-Medium': require('../../assets/fonts/Kanit-Medium.ttf'),
  
});

const onLayoutRootView = useCallback(async () => {
  if (fontsLoaded) {
    await SplashScreen.hideAsync();
  }
}, [fontsLoaded]);

if (!fontsLoaded) {
  return null;
}

function TeacherHomeScreen() {
  return (
    <View style={{ flex: 1}}>
      <TeacherHome />
      <BottomTab />

    </View>
  )
}

function StudentHomeScreen() {
  return (
    <View style={{flex : 1}}>
      <Home />
      <BottomTab />

    </View>
  )
}

function AdminHomeScreen(){
  return (
    <View style={{flex:1}}>
      <AdminHome />
      <BottomTab />

    </View>
  )
}



  const TeacherStackNavigator = () => (
      <Stack.Navigator initialRouteName="Home">
          {/* Teacher specific screens */}
          <Stack.Screen
      name="Home"
      component={BottomTab}
      
      options={{ headerShown: false }} 
    />
    <Stack.Screen name="Post" component={Post} options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Post',
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
    <Stack.Screen name="AttendanceScreen" component={AttendanceScreen} options={{ headerShown: false }} 
/>
<Stack.Screen
  name="ContactUs"
  component={ContactUs}
  options={{ headerShown: false }} 
/> 
    <Stack.Screen name="TakeAttendance" component={TakeAttendance}  options={{ headerShown: false }} 
/> 
    <Stack.Screen name="SeeAttendance" component={SeeAttendanceScreen} options={{ headerShown: false }}  />  
    <Stack.Screen name="ClassSchedule" component={ClassSchedule}  options={{ headerShown: false }} 
/> 
<Stack.Screen name="Grades" component={Grades}  options={{ headerShown: false }} 
/> 
<Stack.Screen name="MarkSheet" component={MarkSheet}options={{ headerShown: false }} 
/> 
<Stack.Screen name="PND" component={PND} options={{ headerShown: false }} 
/> 
<Stack.Screen name="GrowthReport" component={GrowthReport} options={{ headerShown: false }} 
/> 

<Stack.Screen name="Results" component={Results} options={{ headerShown: false }} 
/> 
<Stack.Screen name="Transcripts" component={Transcript}options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Progress Report',
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
      <Stack.Screen name="Assignments" component={Assignments} options={{ headerShown: false }} 
/> 
      <Stack.Screen name="CreateAssignment" component={CreateAssignment} options={{ headerShown: false }} 
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
  component={BottomTab}
  options={{ headerShown: false }} 
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
<Stack.Screen name="Transcripts" component={Transcript}options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Progress Report',
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

<Stack.Screen name="PaymentScreen" component={PaymentScreen}      options={{ headerShown: false }} 
/> 
<Stack.Screen name="StudentAttendance" component={StudentAttendance}   options={{ headerShown: false }} 
/> 
    <Stack.Screen name="ClassSchedule" component={ClassSchedule}  options={{ headerShown: false }} 
/> 
<Stack.Screen name="StudentProgress" component={StudentProgress}  options={{ headerShown: false }} 
/> 
<Stack.Screen
  name="ContactUs"
  component={ContactUs}
  options={{ headerShown: false }} 
/> 
      <Stack.Screen name="StudentAssignments" component={StudentAssignments} options={{
    headerShown: false,
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
    <Stack.Navigator initialRouteName="AdminHome">
        {/* Student specific screens */}
        <Stack.Screen
      name="Home"
      component={BottomTab}
     options={{ headerShown: false }} 
    />
        <Stack.Screen name="Post" component={Post} options={{
    headerStyle: { backgroundColor: 'white' },
    title: 'Post',
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
  options={{ headerShown: false }} 
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
  options={{ headerShown: false }}
/>


    <Stack.Screen name="StudentForm" component={StudentForm}  options={{ headerShown: false }} 
/>
      <Stack.Screen name="GradeSetter" component={GradeSetter} options={{ headerShown: false }}  />
      <Stack.Screen name="AttendanceScreen" component={AttendanceScreen}  options={{
    headerStyle: { backgroundColor: 'black' },
    title: '',
    headerTintColor: 'white',
    headerBackTitle: 'Back',
    headerRight: () => <TopTab />,
    
  }}
/>
      <Stack.Screen name="PaymentScreen" component={PaymentScreen}      options={{ headerShown: false }} 
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
    <Stack.Screen name="AddTermScreen" component={AddTermScreen} options={{ headerShown: false }}  /> 
   

        {/* Repeat for common screens like About, Account, etc. */}
    </Stack.Navigator>
);

  const AuthenticationStackNavigator = () => (
      <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }}  />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false}} />
         
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
              options={{ headerShown: false }}
            />
          ) : userRole === 'admin' ? (
            <Drawer.Screen
              name="Admin Portal"
              component={AdminStackNavigator}
              options={{ headerShown: false }}
            />
          ) : (
            <Drawer.Screen
            name="Student Portal"
            component={StudentStackNavigator}
            options={{ headerShown: false }}
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