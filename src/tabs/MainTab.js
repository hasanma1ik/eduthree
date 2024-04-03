import { View, Text } from 'react-native'
import React,{useContext} from 'react'
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



const MainTab = () => {
  const [state] = useContext(AuthContext);
  const authenticatedUser = state?.user && state?.token;
  const userRole = state?.user?.role;

  const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

  const TeacherStackNavigator = () => (
      <Stack.Navigator initialRouteName="Home">
          {/* Teacher specific screens */}
          <Stack.Screen name="Home" component={Home} options={{title: "Learn Academy",
     headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Post" component={Post} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Messages" component={Messages} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="About" component={About} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Account" component={Account} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />

    <Stack.Screen name="MyPosts" component={MyPosts} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="AttendanceScreen" component={AttendanceScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> 
    <Stack.Screen name="TakeAttendance" component={TakeAttendance} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> 
    <Stack.Screen name="SeeAttendance" component={SeeAttendanceScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> 
    <Stack.Screen name="ClassSchedule" component={ClassSchedule} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> 


    <Stack.Screen name="TimetableScreen" component={TimetableScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    {/* <Stack.Screen name="CalendarScreen" component={CalendarScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> */}
      <Stack.Screen name="ChatScreen" component={ChatScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="Assignments" component={Assignments} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="CreateAssignment" component={CreateAssignment} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="CreateClasses" component={CreateClasses} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
      {/* <Stack.Screen name="ClassesScreen" component={ClassesScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> */}
      <Stack.Screen name="StudentForm" component={StudentForm} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="GradeSetter" component={GradeSetter} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />

      </Stack.Navigator>
  );

  const StudentStackNavigator = () => (
      <Stack.Navigator initialRouteName="Home">
          {/* Student specific screens */}
          <Stack.Screen name="Home" component={Home} options={{title: "Learn Academy", headerRight:()=> <TopTab />}} />
          <Stack.Screen name="Messages" component={Messages} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Account" component={Account} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />


    <Stack.Screen name="ClassSchedule" component={ClassSchedule} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> 
      <Stack.Screen name="Assignments" component={Assignments} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
      

          {/* Repeat for common screens like About, Account, etc. */}
      </Stack.Navigator>
  );

  const AdminStackNavigator = () => (
    <Stack.Navigator initialRouteName="Home">
        {/* Student specific screens */}
        <Stack.Screen name="Home" component={Home} options={{title: "Learn Academy", headerRight:()=> <TopTab />}} />
        <Stack.Screen name="Post" component={Post} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
        <Stack.Screen name="Messages" component={Messages} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
  <Stack.Screen name="Notifications" component={NotificationsScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
  <Stack.Screen name="Account" component={Account} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />

  <Stack.Screen name="MyPosts" component={MyPosts} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
  <Stack.Screen name="CreateClasses" component={CreateClasses} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="StudentForm" component={StudentForm} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="GradeSetter" component={GradeSetter} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="AttendanceScreen" component={AttendanceScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> 
      <Stack.Screen name="TakeAttendance" component={TakeAttendance} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> 
    <Stack.Screen name="SeeAttendance" component={SeeAttendanceScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> 
    <Stack.Screen name="AddTermScreen" component={AddTermScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> 

   

        {/* Repeat for common screens like About, Account, etc. */}
    </Stack.Navigator>
);

  const AuthenticationStackNavigator = () => (
      <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginPage} />
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
            <Drawer.Screen name="TeacherStack" component={TeacherStackNavigator} />
          ) : userRole === 'admin' ? (
            <Drawer.Screen name="AdminStack" component={AdminStackNavigator} />
          ) :  ( 
            <Drawer.Screen name="StudentStack" component={StudentStackNavigator} />
          )}
        </Drawer.Navigator>
        
      ) : (
        <AuthenticationStackNavigator />
      )}
    </>
  );
};

export default MainTab;