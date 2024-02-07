import { StatusBar } from 'expo-status-bar';
import { StyleSheet, useEffect, Text, View, Button} from 'react-native';
import { useFonts} from 'expo-font'
import * as SplashScreen from 'expo-splash-screen';
import { ClerkProvider, SignedIn, SignedOut, useAuth  } from "@clerk/clerk-expo";
import { useCallback } from 'react';
import * as SecureStore from "expo-secure-store";
import { NavigationContainer } from '@react-navigation/native';
import TabNavigation from './src/navigations/TabNavigation';
import RootNavigation from './Navigation';
import { UserProvider } from './src/screen/context/userContext';
import { ThreadsProvider } from './src/screen/context/ThreadsContext';


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
  const { isLoaded, signOut } = useAuth();
  if (!isLoaded) {
    return null;
  }
  return (
    <View style={styles.signOutContainer}>
      <Button
        title="Sign Out"
        onPress={async () => {
          try {
            await signOut();
          } catch (error) {
            console.error("Error signing out: ", error);
          }
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
    <UserProvider>
      <ClerkProvider
        tokenCache={tokenCache}
        publishableKey={'pk_test_bWVldC1jbGFtLTQ4LmNsZXJrLmFjY291bnRzLmRldiQ'}
      >
        <NavigationContainer>
          <View style={styles.container} onLayout={onLayoutRootView}>
            <SignedIn>
              {/* It seems like you intended to use a navigation stack/container here,
                  but you've used a non-existent <stackContainer> component.
                  Ensure you correctly implement your navigation structure here. */}
              <TabNavigation />
              <SignOut />
            </SignedIn>
            <SignedOut>
              <RootNavigation />
            </SignedOut>
            <StatusBar style="auto" />
          </View>
        </NavigationContainer>
      </ClerkProvider>
    </UserProvider>
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
