// src/screen/AdminClasses.js
import React, { useEffect, useState, useCallback, useContext, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, FlatList, Alert,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { AuthContext } from './screen/context/authContext';

SplashScreen.preventAutoHideAsync();

const GRADES = ['KG-1','KG-2','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8'];
const GRADE_SECTIONS = {
  'KG-1': ['A','B','C'],'KG-2': ['A','B','C'],
  'Grade 1': ['A','B','C'],'Grade 2': ['A','B','C'],'Grade 3': ['A','B','C'],
  'Grade 4': ['A','B','C'],'Grade 5': ['A','B','C'],'Grade 6': ['A','B','C'],
  'Grade 7': ['A','B','C'],'Grade 8': ['A','B','C'],
};
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const AdminClasses = () => {
  const navigation = useNavigation();
  const [auth] = useContext(AuthContext);
  const token = auth?.token;

  // fonts
  const [fontsLoaded] = useFonts({ 'Ubuntu-Bold': require('../assets/fonts/Ubuntu-Bold.ttf') });
  const onLayoutRootView = useCallback(async () => { if (fontsLoaded) await SplashScreen.hideAsync(); }, [fontsLoaded]);

  // filters
  const [q, setQ] = useState('');
  const [term, setTerm] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [section, setSection] = useState('');
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');
  const [day, setDay] = useState('');

  const sectionOptions = useMemo(() => gradeLevel ? (GRADE_SECTIONS[gradeLevel] || []) : [], [gradeLevel]);

  // options
  const [terms, setTerms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // data
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage]   = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const headers = useMemo(() => token ? { Authorization: `Bearer ${token}` } : undefined, [token]);

  // load dropdowns
  const loadOptions = useCallback(async () => {
    try {
      const [tRes, sRes, tchRes] = await Promise.all([
        axios.get('/auth/terms'),
        axios.get('/auth/subjects', { headers }),
        axios.get('/auth/teachers'),
      ]);
      setTerms(tRes.data?.terms || []);
      const subj = Array.isArray(sRes?.data?.subjects) ? sRes.data.subjects : [];
      setSubjects(subj);
      setTeachers(tchRes.data?.teachers || []);
    } catch (e) {
      // fallback if subjects require auth and it failed
      if (!subjects.length) setSubjects([]);
      setTeachers(prev => prev || []);
    }
  }, [headers]);

  const fetchClasses = useCallback(async (reset = true, goToPage = 1) => {
    try {
      setLoading(true);
      const params = {
        q: q || undefined,
        term: term || undefined,
        gradeLevel: gradeLevel || undefined,
        section: section || undefined,
        subject: subject || undefined,
        teacher: teacher || undefined,
        day: day || undefined,
        page: goToPage,
        limit: 25,
      };
      const { data } = await axios.get('/auth/admin/classes', { params, headers });
      if (reset) {
        setClasses(data?.classes || []);
      } else {
        setClasses(prev => [...prev, ...(data?.classes || [])]);
      }
      setPage(data?.page || 1);
      setPages(data?.pages || 1);
      setTotal(data?.total || 0);
    } catch (e) {
      console.error('fetchClasses error', e?.response?.data || e);
      Alert.alert('Error', e?.response?.data?.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, [q, term, gradeLevel, section, subject, teacher, day, headers]);

  useEffect(() => { loadOptions(); fetchClasses(true, 1); }, [loadOptions, fetchClasses]);

  useEffect(() => {
    const id = setTimeout(() => fetchClasses(true, 1), 350);
    return () => clearTimeout(id);
  }, [q, term, gradeLevel, section, subject, teacher, day, fetchClasses]);

  const loadMore = () => {
    if (loading) return;
    if (page < pages) fetchClasses(false, page + 1);
  };

  const confirmArchive = (cls) => {
    Alert.alert(
      'Archive Class',
      `Archive "${cls?.grade} • ${cls?.subject?.name || 'Subject'}"? Students won’t see it in active schedules.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Archive', onPress: () => archiveClass(cls._id) },
      ]
    );
  };

  const archiveClass = async (id) => {
    try {
      await axios.patch(`/auth/admin/classes/${id}/archive`, { isArchived: true }, { headers });
      setClasses(prev => prev.filter(c => c._id !== id));
      setTotal(t => Math.max(0, t - 1));
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to archive class');
    }
  };

  const confirmDelete = (cls) => {
    Alert.alert(
      'Delete Class',
      `Delete "${cls?.grade} • ${cls?.subject?.name || 'Subject'}"? This may remove links from students/schedules.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteClass(cls._id) },
      ]
    );
  };

  const deleteClass = async (id) => {
    try {
      await axios.delete(`/auth/admin/classes/${id}`, { headers });
      setClasses(prev => prev.filter(c => c._id !== id));
      setTotal(t => Math.max(0, t - 1));
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to delete class');
    }
  };

  const renderItem = ({ item }) => {
    const sessions = Array.isArray(item.sessions) && item.sessions.length > 0 ? item.sessions : null;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.classTitle}>{item.grade}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#6C757D' }]} onPress={() => confirmArchive(item)}>
              <Text style={styles.actionText}>Archive</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#D7263D' }]} onPress={() => confirmDelete(item)}>
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Term</Text>
          <Text style={styles.value}>{item.term?.name || '—'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Subject</Text>
          <Text style={styles.value}>{item.subject?.name || '—'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Teacher</Text>
          <Text style={styles.value}>{item.teacher?.name || '—'}</Text>
        </View>

        {sessions ? (
          <View style={{ marginTop: 6 }}>
            <Text style={styles.label}>Sessions</Text>
            {sessions.map((s, idx) => (
              <Text key={idx} style={styles.valueSmall}>
                • {s.day}: {s.startUtc} - {s.endUtc} (UTC)
              </Text>
            ))}
          </View>
        ) : (
          <View style={styles.row}>
            <Text style={styles.label}>Schedule</Text>
            <Text style={styles.value}>
              {item.day || '—'} {item.timeSlot ? `• ${item.timeSlot} (UTC)` : ''}
            </Text>
          </View>
        )}

        <View style={styles.row}>
          <Text style={styles.label}>Enrolled</Text>
          <Text style={styles.value}>{Array.isArray(item.users) ? item.users.length : 0}</Text>
        </View>
      </View>
    );
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.wrapper} onLayout={onLayoutRootView}>
      {/* Header */}
      <View style={styles.topHalf}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>All Classes</Text>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <View style={styles.filtersHeader}>
          <Text style={styles.filtersTitle}>Classes</Text>
          <Text style={styles.totalText}>Total: {total}</Text>
        </View>

        <TextInput
          style={styles.search}
          placeholder="Search (grade/subject/teacher)"
          value={q}
          onChangeText={setQ}
        />

        <RNPickerSelect
          onValueChange={setTerm}
          items={[{ label: 'All terms', value: '' }, ...(terms || []).map(t => ({ label: t.name, value: t._id }))]}
          value={term}
          useNativeAndroidPickerStyle={false}
          style={pickerSelectStyles}
          placeholder={{}}
        />

        <RNPickerSelect
          onValueChange={(v) => { setGradeLevel(v || ''); setSection(''); }}
          items={[{ label: 'All grades', value: '' }, ...GRADES.map(g => ({ label: g, value: g }))]}
          value={gradeLevel}
          useNativeAndroidPickerStyle={false}
          style={pickerSelectStyles}
          placeholder={{}}
        />

        <RNPickerSelect
          onValueChange={setSection}
          items={[{ label: 'All sections', value: '' }, ...sectionOptions.map(s => ({ label: s, value: s }))]}
          value={section}
          disabled={!gradeLevel}
          useNativeAndroidPickerStyle={false}
          style={pickerSelectStyles}
          placeholder={{}}
        />

        <RNPickerSelect
          onValueChange={setSubject}
          items={[{ label: 'All subjects', value: '' }, ...(subjects || []).map(s => ({ label: s.name, value: s._id }))]}
          value={subject}
          useNativeAndroidPickerStyle={false}
          style={pickerSelectStyles}
          placeholder={{}}
        />

        <RNPickerSelect
          onValueChange={setTeacher}
          items={[{ label: 'All teachers', value: '' }, ...(teachers || []).map(t => ({ label: t.name, value: t._id }))]}
          value={teacher}
          useNativeAndroidPickerStyle={false}
          style={pickerSelectStyles}
          placeholder={{}}
        />

        <RNPickerSelect
          onValueChange={setDay}
          items={[{ label: 'All days', value: '' }, ...DAYS.map(d => ({ label: d, value: d }))]}
          value={day}
          useNativeAndroidPickerStyle={false}
          style={pickerSelectStyles}
          placeholder={{}}
        />

        <TouchableOpacity style={styles.refreshBtn} onPress={() => fetchClasses(true, 1)}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading && classes.length === 0 ? (
        <View style={styles.loadingWrap}><ActivityIndicator /></View>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={page < pages ? <ActivityIndicator style={{ marginVertical: 12 }} /> : null}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#777' }}>No classes found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F7F9FB' },

  // Header like your Ubuntu header
  topHalf: {
    width: 393, height: 128, backgroundColor: '#006446', alignSelf: 'center',
    borderTopLeftRadius: 35, borderTopRightRadius: 35, paddingHorizontal: 20,
    paddingTop: 30, paddingBottom: 10, marginTop: 30, alignItems: 'center',
    justifyContent: 'center', position: 'relative',
  },
  backButton: { position: 'absolute', top: 59, left: 10, padding: 10, zIndex: 1 },
  pageTitle: { fontSize: 18, color: '#FFFFFF', fontFamily: 'Ubuntu-Bold' },

  filters: {
    backgroundColor: '#fff', padding: 10, borderRadius: 8, marginHorizontal: 12, marginTop: 12,
    borderWidth: 1, borderColor: '#E6E8EB',
  },
  filtersHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filtersTitle: { fontSize: 18, fontFamily: 'Ubuntu-Bold', color: '#111' },
  totalText: { fontSize: 12, color: '#444' },
  search: {
    backgroundColor: '#F2F4F7', borderRadius: 8, paddingHorizontal: 12, height: 42,
    marginTop: 8, marginBottom: 8,
  },
  refreshBtn: {
    alignSelf: 'flex-end', backgroundColor: '#006446', paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 8, marginTop: 8,
  },
  refreshText: { color: '#fff', fontWeight: 'bold' },

  card: {
    backgroundColor: '#fff', borderRadius: 10, padding: 12, marginHorizontal: 12, marginTop: 10,
    borderWidth: 1, borderColor: '#E6E8EB',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  classTitle: { fontSize: 16, fontFamily: 'Ubuntu-Bold', color: '#111' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  actionText: { color: '#fff', fontFamily: 'Ubuntu-Bold' },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  label: { color: '#444', fontFamily: 'Ubuntu-Bold' },
  value: { color: '#111', fontFamily: 'Ubuntu-Bold', textAlign: 'right' },
  valueSmall: { color: '#111', fontFamily: 'Ubuntu-Bold', marginTop: 3 },

  loadingWrap: { paddingVertical: 24, alignItems: 'center' },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 14, paddingVertical: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: '#E0E0E0',
    borderRadius: 8, color: '#333', backgroundColor: '#FFFFFF', marginTop: 8,
    fontFamily: 'Ubuntu-Bold',
  },
  inputAndroid: {
    fontSize: 14, paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: '#E0E0E0',
    borderRadius: 8, color: '#333', backgroundColor: '#FFFFFF', marginTop: 8,
    fontFamily: 'Ubuntu-Bold',
  },
});

export default AdminClasses;
