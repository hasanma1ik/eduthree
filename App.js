// App.js
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useCallback } from "react";
import { StyleSheet, View, Button } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ClerkProvider, SignedIn, SignedOut, useAuth } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import TabNavigation from './src/navigations/TabNavigation';
import RootNavigation from './Navigation';
import { UserProvider } from './src/screen/context/userContext';
import { NotificationProvider } from './NotificationContext';
import { theme } from './src/theme';

SplashScreen.preventAutoHideAsync();
const tokenCache = {
  async getToken(key) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key, value) {
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
    <NotificationProvider>
      <UserProvider>
        <ClerkProvider
          tokenCache={tokenCache}
          publishableKey={'pk_test_bWVldC1jbGFtLTQ4LmNsZXJrLmFjY291bnRzLmRldiQ'}
        >
          <PaperProvider theme={theme}>
            <NavigationContainer>
              <View style={styles.container} onLayout={onLayoutRootView}>
                <SignedIn>
                  <TabNavigation />
                  <SignOut />
                </SignedIn>
                <SignedOut>
                  <RootNavigation />
                </SignedOut>
                <StatusBar style="auto" />
              </View>
            </NavigationContainer>
          </PaperProvider>
        </ClerkProvider>
      </UserProvider>
    </NotificationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // Apply the theme background color
  },
  signOutContainer: {
    position: 'absolute',
    top: 42,
    right: 20,
    zIndex: 1000, // Ensure it's above other components
  },
});
