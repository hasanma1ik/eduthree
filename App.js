import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button} from 'react-native';
import { useFonts} from 'expo-font'
import * as SplashScreen from 'expo-splash-screen';
import { ClerkProvider, SignedIn, SignedOut, useAuth  } from "@clerk/clerk-expo";
import LoginPage from './src/LoginPage';
import { useCallback } from 'react';
import * as SecureStore from "expo-secure-store";
import { NavigationContainer } from '@react-navigation/native';
import TabNavigation from './src/navigations/TabNavigation';
import RegisterScreen from './src/screen/RegisterScreen';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './src/screen/Login';
import { AuthProvider } from './src/screen/context/authContext';
import Home from './src/screen/Home';


const Stack = createStackNavigator();

SplashScreen.preventAutoHideAsync();
const tokenCache = {
  async getToken(key) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key,value) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};
const SignOut = () => {
  const { isLoaded,signOut } = useAuth();
  if (!isLoaded) {
    return null;
  }
  return (
    <View style={styles.signOutContainer}>
      <Button
        title="Sign Out"
        onPress={() => {
          signOut();
        }}
      />
    </View>
  );
};


export default function App() {
  const [fontsLoaded] = useFonts({
    'outfit': require('./assets/fonts/Outfit-Regular.ttf'),
    'outfit-medium': require('./assets/fonts/Outfit-SemiBold.ttf'),
    'outfit-bold': require('./assets/fonts/Outfit-Bold.ttf'),

  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }
  
  return (
    <ClerkProvider
    tokenCache={tokenCache}
    publishableKey={'pk_test_bWVldC1jbGFtLTQ4LmNsZXJrLmFjY291bnRzLmRldiQ'}>
       
       <View style={styles.container} onLayout={onLayoutRootView}>
        <SignedIn>
          <NavigationContainer>
            
            <TabNavigation />
          </NavigationContainer>
          <SignOut />
        </SignedIn>
        <SignedOut>
          {/* Use a stack navigator for authentication flows */}
          <NavigationContainer>
          <AuthProvider>
            <Stack.Navigator initialRouteName="Login" headerShown="false">
            <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="Login" component={LoginPage} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Login1" component={Login} />

            </Stack.Navigator>
            </AuthProvider>
          </NavigationContainer>
        </SignedOut>
        <StatusBar style="auto" />
      </View>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
   flex: 1
  },
  signOutContainer: {
    position: 'absolute',
    top: 42,
    right: 20,
    zIndex: 1000, // Ensure it's above other components
  },
});
