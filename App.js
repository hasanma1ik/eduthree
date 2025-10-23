// App.js
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';

import TabNavigation from './src/navigations/TabNavigation';
import RootNavigation from './Navigation';
import { UserProvider } from './src/screen/context/userContext';
import { NotificationProvider } from './NotificationContext';
import { AuthProvider, AuthContext } from './src/screen/context/authContext';
import { theme } from './src/theme';

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const [state] = useContext(AuthContext);
  const isAuthed = !!state?.token;
  return isAuthed ? <TabNavigation /> : <RootNavigation />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'outfit': require('./assets/fonts/Outfit-Regular.ttf'),
    'outfit-medium': require('./assets/fonts/Outfit-SemiBold.ttf'),
    'outfit-bold': require('./assets/fonts/Outfit-Bold.ttf'),
    'merriweather-sans-bold': require('./assets/fonts/MerriweatherSans-Italic-VariableFont_wght.ttf'),
    'MerriweatherSans-VariableFont_wght': require('./assets/fonts/MerriweatherSans-VariableFont_wght.ttf'),
    'BebasNeue': require('./assets/fonts/BebasNeue-Regular.ttf'),
    'Kanit-Medium': require('./assets/fonts/Kanit-Medium.ttf'),
    'kanitmedium1': require('./assets/fonts/Kanit-Regular.ttf'),
    'Ubuntu-Light': require('./assets/fonts/Ubuntu-Light.ttf'),
    'Ubuntu-Regular': require('./assets/fonts/Ubuntu-Regular.ttf'),
    'Ubuntu-Bold': require('./assets/fonts/Ubuntu-Bold.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <NotificationProvider>
      <UserProvider>
        <AuthProvider>
          <PaperProvider theme={theme}>
            <NavigationContainer>
              <View style={styles.container} onLayout={onLayoutRootView}>
                <AuthGate />
                <StatusBar style="auto" />
              </View>
            </NavigationContainer>
          </PaperProvider>
        </AuthProvider>
      </UserProvider>
    </NotificationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
