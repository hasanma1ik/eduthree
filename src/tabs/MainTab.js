import { View, Text } from 'react-native'
import React,{useContext} from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Home from '../screen/Home';
import LoginPage from '../LoginPage';
import RegisterScreen from '../screen/RegisterScreen';
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




const MainTab = () => {
    // global state

    const [state, setState] = useContext(AuthContext)
    const authenticatedUser = state?.user && state?.token

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const MainStackNavigator = () => (
      <Stack.Navigator initialRouteName="Login" headerShown="false">
        {authenticatedUser ?
    (
    <>
       <Stack.Screen name="Home" component={Home} options={{title: "Learn Academy",
     headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Post" component={Post} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Messages" component={Messages} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="About" component={About} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Account" component={Account} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="MyPosts" component={MyPosts} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
   
    </>) : (
        <> 
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login1" component={Login} />
       
        </>
    )    
    }

      </Stack.Navigator>      
  )
return (
  <>
  {authenticatedUser ?(
    <Drawer.Navigator drawerContent={(props) => <DrawerContent {...props} />}>
    <Drawer.Screen name="Main" component={MainStackNavigator} />
  </Drawer.Navigator>
  ) : (
    <Stack.Navigator initialRouteName="Login" headerShown={false}>
    <Stack.Screen name="Login" component={LoginPage} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="Login1" component={Login} />
  </Stack.Navigator>
  )}
  
  </>
)
}

export default MainTab