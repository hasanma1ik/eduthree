// src/screen/SectionAssignments.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, StyleSheet, Alert, Text, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useNavigation } from '@react-navigation/native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

SplashScreen.preventAutoHideAsync();

const GRADES = [
  'KG-1','KG-2','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8',
];
const GRADE_SECTIONS = {
  'KG-1': ['A','B','C','D','E'],
  'KG-2': ['A','B','C','D','E'],
  'Grade 1': ['A','B','C','D','E'],
  'Grade 2': ['A','B','C','D','E'],
  'Grade 3': ['A','B','C','D','E'],
  'Grade 4': ['A','B','C','D','E'],
  'Grade 5': ['A','B','C','D','E'],
  'Grade 6': ['A','B','C','D','E'],
  'Grade 7': ['A','B','C','D','E'],
  'Grade 8': ['A','B','C','D','E'],
};

function SectionAssignments() {
  const [gradeLevel, setGradeLevel] = useState('');
  const [section, setSection] = useState('');
  const [term, setTerm] = useState('');

  const [terms, setTerms] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [fontsLoaded] = useFonts({
    'Ubuntu-Bold': require('../assets/fonts/Ubuntu-Bold.ttf'),
  });
  const navigation = useNavigation();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  const sectionOptions = gradeLevel ? (GRADE_SECTIONS[gradeLevel] || []) : [];

  const loadTerms = useCallback(async () => {
    try {
      const res = await axios.get('/auth/terms');
      setTerms(res.data?.terms || []);
    } catch (e) {
      setTerms([]);
    }
  }, []);

  const loadAssignments = useCallback(async () => {
    try {
      setLoadingList(true);
      const res = await axios.get('/auth/sections');
      setAssignments(res.data?.assignments || []);
    } catch (e) {
      console.error('Failed to load assignments:', e?.message || e);
      Alert.alert('Error', 'Failed to load section assignments');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadTerms();
    loadAssignments();
  }, [loadTerms, loadAssignments]);

  const handleCreate = async () => {
    if (!gradeLevel || !section || !term) {
      Alert.alert('Validation', 'Please select grade, section, and term.');
      return;
    }
    try {
      setCreating(true);
      await axios.post('/auth/sections', { gradeLevel, section, term });
      setGradeLevel('');
      setSection('');
      setTerm('');
      loadAssignments();
      Alert.alert('Success', 'Section assigned to term.');
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to create assignment';
      Alert.alert('Error', msg);
    } finally {
      setCreating(false);
    }
  };

  const saveChange = async (id, newTerm) => {
    if (!newTerm) return;
    try {
      setSavingId(id);
      await axios.patch(`/auth/sections/${id}`, { term: newTerm });
      loadAssignments();
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to update assignment');
    } finally {
      setSavingId(null);
    }
  };

  const confirmDelete = (a) => {
    Alert.alert(
      'Delete Assignment',
      `Remove mapping ${a.gradeLevel} ${a.section} from "${a?.term?.name}"?\n\nYou cannot delete if classes exist for this mapping.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDelete(a._id) },
      ]
    );
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await axios.delete(`/auth/sections/${id}`);
      loadAssignments();
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to delete assignment');
    } finally {
      setDeletingId(null);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      {/* Header (same style as Terms page) */}
      <View style={styles.topHalf}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Assign Sections to Terms</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Create form */}
        <Text style={styles.sectionTitle}>Create New Assignment</Text>

        <Text style={styles.label}>Grade</Text>
        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={(v) => { setGradeLevel(v || ''); setSection(''); }}
            items={GRADES.map(g => ({ label: g, value: g }))}
            placeholder={{ label: 'Select grade', value: null }}
            value={gradeLevel}
            useNativeAndroidPickerStyle={false}
            style={pickerSelectStyles}
            Icon={() => <Text style={styles.icon}>▼</Text>}
          />
        </View>

        <Text style={styles.label}>Section</Text>
        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={setSection}
            items={sectionOptions.map(s => ({ label: s, value: s }))}
            placeholder={{ label: gradeLevel ? 'Select section' : 'Choose grade first', value: null }}
            value={section}
            disabled={!gradeLevel}
            useNativeAndroidPickerStyle={false}
            style={pickerSelectStyles}
            Icon={() => <Text style={styles.icon}>▼</Text>}
          />
        </View>

        <Text style={styles.label}>Term / Batch</Text>
        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={setTerm}
            items={(terms || []).map(t => ({ label: t.name, value: t._id }))}
            placeholder={{ label: 'Select term', value: null }}
            value={term}
            useNativeAndroidPickerStyle={false}
            style={pickerSelectStyles}
            Icon={() => <Text style={styles.icon}>▼</Text>}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleCreate} disabled={creating}>
          <Text style={styles.submitButtonText}>{creating ? 'Saving...' : 'Assign Section'}</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* List existing assignments */}
        <Text style={styles.sectionTitle}>Existing Assignments</Text>

        {loadingList ? (
          <View style={{ paddingVertical: 20 }}><ActivityIndicator /></View>
        ) : assignments.length === 0 ? (
          <Text style={{ color: '#666', marginBottom: 12 }}>No assignments found.</Text>
        ) : (
          assignments.map(a => (
            <View key={a._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{a.gradeLevel} — {a.section}</Text>
                <TouchableOpacity
                  style={[styles.delBtn]}
                  onPress={() => confirmDelete(a)}
                  disabled={deletingId === a._id}
                >
                  <Text style={styles.delText}>{deletingId === a._id ? '...' : 'Delete'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.subtleText}>
                Current Term: <Text style={styles.bold}>{a?.term?.name || '—'}</Text>
              </Text>
              {a?.term?.startDate && a?.term?.endDate ? (
                <Text style={styles.subtleText}>
                  {String(a.term.startDate).slice(0,10)} → {String(a.term.endDate).slice(0,10)}
                </Text>
              ) : null}

              <Text style={[styles.label, { marginTop: 10 }]}>Change Term</Text>
              <View style={styles.pickerWrapper}>
                <RNPickerSelect
                  onValueChange={(v) => v && saveChange(a._id, v)}
                  items={(terms || []).map(t => ({ label: t.name, value: t._id }))}
                  placeholder={{ label: 'Select new term', value: null }}
                  useNativeAndroidPickerStyle={false}
                  style={pickerSelectStyles}
                  Icon={() => <Text style={styles.icon}>▼</Text>}
                />
              </View>
              {savingId === a._id ? <ActivityIndicator style={{ marginTop: 6 }} /> : null}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  scrollContainer: { padding: 20 },

  // Header (matches Terms page)
  topHalf: {
    width: 393, height: 128, backgroundColor: '#006446', alignSelf: 'center',
    borderTopLeftRadius: 35, borderTopRightRadius: 35,
    paddingHorizontal: 20, paddingTop: 30, paddingBottom: 10, marginTop: 30,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  backButton: { position: 'absolute', top: 59, left: 10, padding: 10, zIndex: 1 },
  pageTitle: { fontSize: 18, color: '#FFFFFF', fontFamily: 'Ubuntu-Bold' },

  sectionTitle: { fontSize: 16, color: '#006446', fontFamily: 'Ubuntu-Bold', marginBottom: 10 },
  label: { fontSize: 14, fontFamily: 'Ubuntu-Bold', color: '#34495E', marginBottom: 8 },
  pickerWrapper: {
    borderWidth: 1, borderColor: '#DADADA', borderRadius: 8, backgroundColor: '#FFFFFF',
    paddingHorizontal: 12, marginBottom: 14,
  },
  icon: { color: '#34495E', fontSize: 18, paddingRight: 10 },

  submitButton: {
    backgroundColor: '#006446', borderRadius: 8, paddingVertical: 15,
    justifyContent: 'center', alignItems: 'center', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 5,
  },
  submitButtonText: { color: '#FFF', fontSize: 18, fontFamily: 'Ubuntu-Bold' },

  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 20 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#E6E8EB',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontFamily: 'Ubuntu-Bold', fontSize: 16, color: '#111' },
  subtleText: { fontFamily: 'Ubuntu-Bold', color: '#444', marginTop: 6 },
  bold: { fontFamily: 'Ubuntu-Bold', color: '#111' },

  delBtn: { backgroundColor: '#D7263D', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  delText: { color: '#fff', fontFamily: 'Ubuntu-Bold' },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16, paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8,
    color: '#34495E', backgroundColor: '#FFFFFF', paddingRight: 30, fontFamily: 'Ubuntu-Bold',
  },
  inputAndroid: {
    fontSize: 16, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8,
    color: '#34495E', backgroundColor: '#FFFFFF', paddingRight: 30, fontFamily: 'Ubuntu-Bold',
  },
});

export default SectionAssignments;
