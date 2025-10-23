import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { AuthContext } from './screen/context/authContext';

const AddUsers = () => {
  const [role, setRole] = useState('Student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [state] = useContext(AuthContext);
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    'Ubuntu-Bold': require('../assets/fonts/Ubuntu-Bold.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  // password strength rules: min 6, at least one letter, one number
  const getPasswordStrength = (pwd) => {
    if (pwd.length === 0) return { label: '', color: '' };

    const hasLetter = /[A-Za-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);

    if (pwd.length < 6 || !hasLetter || !hasNumber) {
      return { label: 'Weak', color: 'red' };
    }
    if (pwd.length < 10) {
      return { label: 'Medium', color: 'orange' };
    }
    return { label: 'Strong', color: 'green' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleCreateUser = async () => {
    if (!email || !password || !name || !confirmPassword) {
      Alert.alert('Missing Fields', 'All fields are required.');
      return;
    }

    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }
    if (!hasLetter || !hasNumber) {
      Alert.alert(
        'Weak Password',
        'Password must include at least one letter and one number.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    try {
      await axios.post(
        '/auth/admin/create-user',
        { email, password, role, name },
        { headers: { Authorization: `Bearer ${state?.token}` } }
      );

      Alert.alert('Success', `${role} user created.`);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setRole('Student');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err?.response?.data?.message || 'User creation failed');
    }
  };

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      {/* Header */}
      <View style={styles.topHalf}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Add Users</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="John Doe"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder="user@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholder="Enter password"
            secureTextEntry={!showPassword}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <FontAwesome5 name={showPassword ? 'eye-slash' : 'eye'} size={18} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Password Strength Bar */}
        {password.length > 0 && (
          <View style={styles.strengthContainer}>
            <View style={[styles.strengthBar, { backgroundColor: passwordStrength.color }]} />
            <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
              {passwordStrength.label}
            </Text>
          </View>
        )}

        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            placeholder="Re-enter password"
            secureTextEntry={!showPassword}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <FontAwesome5 name={showPassword ? 'eye-slash' : 'eye'} size={18} color="#999" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Role</Text>
        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={(value) => setRole(value)}
            items={[
              { label: 'Student', value: 'Student' },
              { label: 'Teacher', value: 'Teacher' },
              { label: 'Administrator', value: 'Admin' },
            ]}
            placeholder={{ label: 'Select role', value: null }}
            value={role}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
            Icon={() => <Text style={styles.icon}>▼</Text>}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleCreateUser}>
          <Text style={styles.buttonText}>Create User</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 20,
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
    marginTop: 10,
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
  contentContainer: {
    paddingVertical: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFF',
    marginBottom: 15,
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
    color: '#34495E',
  },
  passwordWrapper: {
    position: 'relative',
    marginBottom: 15,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 14,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  strengthBar: {
    width: 70,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  strengthLabel: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Bold',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  icon: {
    color: '#34495E',
    fontSize: 18,
    paddingRight: 10,
  },
  button: {
    backgroundColor: '#006446',
    borderRadius: 8,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Ubuntu-Bold',
    fontSize: 18,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    color: '#34495E',
    backgroundColor: '#FFFFFF',
    paddingRight: 30,
    fontFamily: 'Ubuntu-Bold',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    color: '#34495E',
    backgroundColor: '#FFFFFF',
    paddingRight: 30,
    fontFamily: 'Ubuntu-Bold',
  },
  placeholder: {
    color: '#999',
    fontFamily: 'Ubuntu-Bold',
  },
});
export default AddUsers;


