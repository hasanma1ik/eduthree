import { View, Text } from 'react-native'
import React, { useContext, useCallback } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Home from '../screen/Home';
import LoginPage from '../LoginPage';
import RegisterScreen from '../screen/RegisterScreen';
import handleForgetPassword  from '../screen/forgetpasswordscreen';
import Login from '../screen/Login';
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
import TakeAttendance from '../TakeAttendance';
import SeeAttendanceScreen from '../SeeAttendance';
import NotificationsScreen from '../screen/Notifications';
import ClassSchedule from '../ClassSchedule';
import AddTermScreen from '../TermScreen';
import PostDetail from '../PostDetail';
import { Image } from 'react-native'
import { useFonts } from 'expo-font';



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
      component={Home}
      options={{
        headerTitle: () => (
          <Image
            source={require('./../../assets/lalogo.jpg')} // Adjust the path to your logo
            style={{ width :80, height: 40 }} // Adjust the size as needed
            resizeMode="contain"
          />
        ),
        headerTitleStyle: { color: '#228B22'},
        headerRight: () => <TopTab />,
      }}
    />
    <Stack.Screen name="Post" component={Post} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Messages" component={Messages} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="About" component={About} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Account" component={Account} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />

    <Stack.Screen name="PostDetail" component={PostDetail} options={{ title: 'Post Detail' }} />

    <Stack.Screen name="MyPosts" component={MyPosts} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="AttendanceScreen" component={AttendanceScreen} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} /> 
    <Stack.Screen name="TakeAttendance" component={TakeAttendance} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} /> 
    <Stack.Screen name="SeeAttendance" component={SeeAttendanceScreen} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} /> 
    <Stack.Screen name="ClassSchedule" component={ClassSchedule} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} /> 


    <Stack.Screen name="TimetableScreen" component={TimetableScreen} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
    {/* <Stack.Screen name="CalendarScreen" component={CalendarScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> */}
      <Stack.Screen name="ChatScreen" component={ChatScreen} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="Assignments" component={Assignments} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="CreateAssignment" component={CreateAssignment} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="CreateClasses" component={CreateClasses} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
      {/* <Stack.Screen name="ClassesScreen" component={ClassesScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> */}
      <Stack.Screen name="StudentForm" component={StudentForm} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="GradeSetter" component={GradeSetter} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />

      </Stack.Navigator>
  );

  const StudentStackNavigator = () => (
      <Stack.Navigator initialRouteName="Home">
          {/* Student specific screens */}
          <Stack.Screen
      name="Home"
      component={Home}
      options={{
        headerTitle: () => (
          <Image
            source={require('./../../assets/lalogo.jpg')} // Adjust the path to your logo
            style={{ width :80, height: 40 }} // Adjust the size as needed
            resizeMode="contain"
          />
        ),
        headerTitleStyle: { color: '#228B22'},
        headerRight: () => <TopTab />,
      }}
    />
          <Stack.Screen name="PostDetail" component={PostDetail} options={{ title: 'Post Detail' }} />
          <Stack.Screen name="Messages" component={Messages} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Account" component={Account} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />


    <Stack.Screen name="ClassSchedule" component={ClassSchedule} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} /> 
      <Stack.Screen name="Assignments" component={Assignments} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
      

          {/* Repeat for common screens like About, Account, etc. */}
      </Stack.Navigator>
  );

  const AdminStackNavigator = () => (
    <Stack.Navigator initialRouteName="Home">
        {/* Student specific screens */}
        <Stack.Screen
      name="Home"
      component={Home}
      options={{
        headerTitle: () => (
          <Image
            source={require('./../../assets/lalogo.jpg')} // Adjust the path to your logo
            style={{ width :80, height: 40 }} // Adjust the size as needed
            resizeMode="contain"
          />
        ),
        headerTitleStyle: { color: '#228B22' },
        headerRight: () => <TopTab />,
      }}
    />
        <Stack.Screen name="Post" component={Post} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
        <Stack.Screen name="Messages" component={Messages} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
  <Stack.Screen name="Notifications" component={NotificationsScreen} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
  <Stack.Screen name="Account" component={Account} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />

  <Stack.Screen name="PostDetail" component={PostDetail} options={{ title: 'Post Detail' }} />


  <Stack.Screen name="MyPosts" component={MyPosts} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
  <Stack.Screen name="CreateClasses" component={CreateClasses} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="StudentForm" component={StudentForm} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="GradeSetter" component={GradeSetter} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="AttendanceScreen" component={AttendanceScreen} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} /> 
      <Stack.Screen name="TakeAttendance" component={TakeAttendance} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} /> 
    <Stack.Screen name="SeeAttendance" component={SeeAttendanceScreen} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} /> 
    <Stack.Screen name="AddTermScreen" component={AddTermScreen} options={{headerBackTitle: 'Back', title: '', headerRight:()=> <TopTab />}} /> 

   

        {/* Repeat for common screens like About, Account, etc. */}
    </Stack.Navigator>
);

  const AuthenticationStackNavigator = () => (
      <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }}  />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Login1" component={Login} options={{ headerShown: false }} />
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
                title: "Faculty Portal",
                headerTitleStyle: {
                  fontFamily: 'merriweather-sans',
                },
              }}
            />
          ) : userRole === 'admin' ? (
            <Drawer.Screen
              name="Admin Portal"
              component={AdminStackNavigator}
              options={{
                title: "Admin Portal",
                headerTitleStyle: {
                  fontFamily: 'merriweather-sans',
                },
              }}
            />
          ) : (
            <Drawer.Screen
              name="Student Portal"
              component={StudentStackNavigator}
              options={{
                title: "Student Portal",
                headerTitleStyle: {
                  color: '#228B22',
                  fontWeight: 'bold',
                  fontFamily: 'merriweather-sans',
                },
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

export default MainTab;