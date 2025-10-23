// src/gradesetter.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';
import SearchableDropdown from 'react-native-searchable-dropdown';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import RNPickerSelect from 'react-native-picker-select';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';

const GRADES = ['KG-1','KG-2','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8'];

const GRADE_SECTIONS = {
  'KG-1': ['A','B','C'],
  'KG-2': ['A','B','C'],
  'Grade 1': ['A','B','C'],
  'Grade 2': ['A','B','C'],
  'Grade 3': ['A','B','C'],
  'Grade 4': ['A','B','C'],
  'Grade 5': ['A','B','C'],
  'Grade 6': ['A','B','C'],
  'Grade 7': ['A','B','C'],
  'Grade 8': ['A','B','C'],
};

SplashScreen.preventAutoHideAsync();

const GradeSetter = () => {
  const navigation = useNavigation();

  // Users (multi-select)
  const [users, setUsers] = useState([]);           // [{id,name}]
  const [selectedUsers, setSelectedUsers] = useState([]); // [{id,name}]

  // Grade/Section
  const [gradeLevel, setGradeLevel] = useState('');
  const [section, setSection] = useState('');

  // Terms/Batches
  const [terms, setTerms] = useState([]);           // [{label, value}]
  const [selectedTerm, setSelectedTerm] = useState('');

  // Fonts
  const [fontsLoaded] = useFonts({
    'Ubuntu-Bold': require('../assets/fonts/Ubuntu-Bold.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/auth/all-users');
        const formatted = (res.data?.users || [])
          .filter(u => u.role === 'student') // bulk-assign students
          .map(u => ({ id: u._id, name: u.name }));
        setUsers(formatted);
      } catch (e) {
        Alert.alert('Error', 'Failed to fetch users');
      }
    };

    const fetchTerms = async () => {
      try {
        const res = await axios.get('/auth/terms');
        const list = Array.isArray(res.data?.terms) ? res.data.terms : [];
        const items = list.map(t => ({
          label: t?.name
            ? `${t.name} (${(t.startDate || '').slice(0,10)} → ${(t.endDate || '').slice(0,10)})`
            : `${(t.startDate || '').slice(0,10)} → ${(t.endDate || '').slice(0,10)}`,
          value: t._id,
        }));
        setTerms(items);
      } catch (e) {
        Alert.alert('Error', 'Failed to fetch batches/terms');
      }
    };

    fetchUsers();
    fetchTerms();
  }, []);

  const sectionOptions = useMemo(() => {
    if (!gradeLevel) return [];
    return GRADE_SECTIONS[gradeLevel] || ['A','B','C'];
  }, [gradeLevel]);

  const addSelectedUser = (item) => {
    setSelectedUsers(prev => (prev.some(u => u.id === item.id) ? prev : [...prev, item]));
  };

  const removeSelectedUser = (id) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleSubmit = async () => {
    if (selectedUsers.length === 0 || !gradeLevel || !section || !selectedTerm) {
      Alert.alert('Error', 'Please select at least one student, a grade, a section, and a batch/term.');
      return;
    }
    const combinedGrade = `${gradeLevel} - ${section}`;

    let success = 0;
    let failed = 0;
    let firstError = null;

    for (const u of selectedUsers) {
      try {
        await axios.post('/auth/users/setGrade', {
          userId: u.id,
          gradeLevel,
          section,
          grade: combinedGrade, // legacy combined string for backend compatibility
          term: selectedTerm,   // associate the student with a batch/term
        });
        success += 1;
      } catch (err) {
        failed += 1;
        if (!firstError) firstError = err?.response?.data?.message || err?.message || 'Failed for at least one user';
      }
    }

    if (failed === 0) {
      Alert.alert('Success', `Updated ${success} student(s).`);
      setSelectedUsers([]);
      setGradeLevel('');
      setSection('');
      setSelectedTerm('');
    } else if (success === 0) {
      Alert.alert('Error', firstError || 'Failed to update students.');
    } else {
      Alert.alert('Partial Success', `Updated ${success} student(s), ${failed} failed.\n${firstError ? `\nFirst error: ${firstError}` : ''}`);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      onLayout={onLayoutRootView}
    >
      {/* Header (same style as your other Ubuntu header) */}
      <View style={styles.topHalf}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Assign Grade • Section • Batch</Text>
      </View>

      {/* Content (NO ScrollView to avoid nested VirtualizedList) */}
      <View style={{ flex: 1, paddingBottom: 24 }}>
        {/* User search (multi-pick) */}
        <View style={styles.block}>
          <Text style={styles.blockLabel}>Add Students</Text>
          <SearchableDropdown
            onItemSelect={addSelectedUser}
            containerStyle={styles.searchableContainer}
            itemStyle={styles.dropdownItemStyle}
            itemTextStyle={styles.dropdownItemText}
            itemsContainerStyle={styles.itemsContainerStyle}
            items={users}
            resetValue={false}
            textInputProps={{
              placeholder: 'Search & tap to add multiple students',
              placeholderTextColor: '#999',
              underlineColorAndroid: 'transparent',
              style: styles.searchableStyle,
            }}
            listProps={{
              keyboardShouldPersistTaps: 'handled',
              // nestedScrollEnabled: true, // not needed since we removed ScrollView
            }}
          />

          {/* Selected chips */}
          {selectedUsers.length > 0 && (
            <View style={styles.chipsWrap}>
              {selectedUsers.map(u => (
                <View key={u.id} style={styles.chip}>
                  <Text style={styles.chipText}>{u.name}</Text>
                  <TouchableOpacity style={styles.chipX} onPress={() => removeSelectedUser(u.id)}>
                    <Text style={styles.chipXText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Grade */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Grade</Text>
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              onValueChange={(value) => { setGradeLevel(value || ''); setSection(''); }}
              items={GRADES.map((g) => ({ label: g, value: g }))}
              placeholder={{ label: 'Select a grade', value: null }}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
              Icon={() => <Text style={styles.icon}>▼</Text>}
              value={gradeLevel}
            />
          </View>
        </View>

        {/* Section */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Section</Text>
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              onValueChange={(value) => setSection(value || '')}
              items={sectionOptions.map((s) => ({ label: s, value: s }))}
              placeholder={{ label: gradeLevel ? 'Select a section' : 'Choose grade first', value: null }}
              disabled={!gradeLevel}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
              Icon={() => <Text style={styles.icon}>▼</Text>}
              value={section}
            />
          </View>
        </View>

        {/* Batch / Term */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Batch / Term</Text>
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              onValueChange={(value) => setSelectedTerm(value || '')}
              items={terms}
              placeholder={{ label: 'Select a batch/term', value: null }}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
              Icon={() => <Text style={styles.icon}>▼</Text>}
              value={selectedTerm}
            />
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>
            Assign to {selectedUsers.length || 0} student{selectedUsers.length === 1 ? '' : 's'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', padding: 20 },

  // Header
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
  backButton: { position: 'absolute', top: 59, left: 10, padding: 10, zIndex: 1 },
  pageTitle: { fontSize: 18, color: '#FFFFFF', fontFamily: 'Ubuntu-Bold' },

  // Blocks
  block: { marginTop: 16 },
  blockLabel: { fontSize: 14, color: '#2C3E50', fontFamily: 'Ubuntu-Bold', marginBottom: 8 },

  // Searchable dropdown styles
  searchableContainer: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  dropdownItemStyle: {
    padding: 12,
    backgroundColor: '#FAFAFA',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    margin: 6,
  },
  dropdownItemText: { color: '#34495E', fontFamily: 'Ubuntu-Bold' },
  itemsContainerStyle: { maxHeight: 180, backgroundColor: '#FFFFFF' },
  searchableStyle: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFF',
    color: '#34495E',
    fontFamily: 'Ubuntu-Bold',
    fontSize: 16,
  },

  // Chips
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9F7EF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#CDEADA',
  },
  chipText: { fontFamily: 'Ubuntu-Bold', color: '#2C3E50' },
  chipX: { marginLeft: 8 },
  chipXText: { fontFamily: 'Ubuntu-Bold', color: '#D7263D', fontSize: 16, lineHeight: 16 },

  // Inputs
  inputContainer: { marginTop: 16, marginBottom: 8 },
  label: { fontSize: 16, fontFamily: 'Ubuntu-Bold', color: '#2C3E50', marginBottom: 8 },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  icon: { color: '#34495E', fontSize: 18, paddingRight: 10 },

  // Submit
  button: {
    backgroundColor: '#006446',
    borderRadius: 8,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    marginTop: 18,
  },
  buttonText: { color: '#FFFFFF', fontFamily: 'Ubuntu-Bold', fontSize: 18 },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    color: '#34495E',
    backgroundColor: '#FFFFFF',
    paddingRight: 30,
    fontFamily: 'Ubuntu-Bold',
  },
  placeholder: { color: '#999', fontFamily: 'Ubuntu-Bold' },
});

export default GradeSetter;
