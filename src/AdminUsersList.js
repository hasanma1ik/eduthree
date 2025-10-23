// src/screen/AdminUsersList.js
import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, FlatList, Alert,
} from 'react-native';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { AuthContext } from './screen/context/authContext';
import { useNavigation } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync();

const GRADES = [
  'KG-1','KG-2','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8',
];

const GRADE_SECTIONS = {
  'KG-1': ['A','B','C'],
  'KG-2': ['A','B','C'],
  'Grade 1': ['A','B','C'],
  'Grade 2': ['A','B','C'],
  'Grade 3': ['A','B','C'],
  'Grade 4': ['A','B','C'],
  'Grade 5': ['A','B','C'],
  'Grade 6': ['A','B','C'],
  'Grade 7': ['A','B'],
  'Grade 8': ['A','B'],
};

const PROTECTED_ADMIN_EMAIL = 'wahaj_kayani@learn.com';

const AdminUsersList = () => {
  const navigation = useNavigation();
  const [auth] = useContext(AuthContext);
  const token = auth?.token;

  // fonts
  const [fontsLoaded] = useFonts({
    'Ubuntu-Bold': require('../assets/fonts/Ubuntu-Bold.ttf'),
    'Ubuntu-Regular': require('../assets/fonts/Ubuntu-Regular.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // filters
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [section, setSection] = useState('');
  const [term, setTerm] = useState('');
  const [terms, setTerms] = useState([]);

  // data
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // deleting state
  const [deletingId, setDeletingId] = useState(null);

  const sectionOptions = gradeLevel ? (GRADE_SECTIONS[gradeLevel] || []) : [];

  const loadTerms = useCallback(async () => {
    try {
      const res = await axios.get('/auth/terms');
      setTerms(res.data?.terms || []);
    } catch (e) {
      setTerms([]);
    }
  }, []);

  const fetchUsers = useCallback(
    async (reset = true, goToPage = 1) => {
      try {
        setLoading(true);
        const params = {
          q: q || undefined,
          role: role || undefined,
          gradeLevel: gradeLevel || undefined,
          section: section || undefined,
          term: term || undefined,
          page: goToPage,
          limit: 25,
        };
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const { data } = await axios.get('/auth/admin/users', { params, headers });

        if (reset) {
          setUsers(data.users || []);
        } else {
          setUsers(prev => [...prev, ...(data.users || [])]);
        }
        setPage(data.page || 1);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
      } catch (err) {
        console.error('fetchUsers error:', err?.response?.data || err.message);
        if (err?.response?.status === 401) {
          Alert.alert('Auth', 'Please sign in again.');
        }
      } finally {
        setLoading(false);
      }
    },
    [q, role, gradeLevel, section, term, token]
  );

  useEffect(() => {
    loadTerms();
    fetchUsers(true, 1);
  }, [loadTerms, fetchUsers]);

  useEffect(() => {
    const id = setTimeout(() => fetchUsers(true, 1), 350);
    return () => clearTimeout(id);
  }, [q, role, gradeLevel, section, term, fetchUsers]);

  const loadMore = () => {
    if (loading) return;
    if (page < pages) fetchUsers(false, page + 1);
  };

  const confirmDelete = (user) => {
    if (user.role === 'admin' && (user.email || '').toLowerCase() === PROTECTED_ADMIN_EMAIL) {
      Alert.alert('Not allowed', 'This admin account cannot be deleted.');
      return;
    }

    Alert.alert(
      'Delete User',
      `Are you sure you want to delete "${user.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDelete(user._id) },
      ]
    );
  };

  const handleDelete = async (userId) => {
    try {
      if (!token) {
        Alert.alert('Auth', 'Missing token. Please sign in again.');
        return;
      }
      setDeletingId(userId);
      await axios.delete(`/auth/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(prev => prev.filter(u => u._id !== userId));
      setTotal(prev => Math.max(0, prev - 1));
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to delete user';
      Alert.alert('Error', msg);
    } finally {
      setDeletingId(null);
    }
  };

  const renderUser = ({ item }) => {
    const isStudent = item.role === 'student';
    const isProtectedAdmin =
      item.role === 'admin' && (item.email || '').toLowerCase() === PROTECTED_ADMIN_EMAIL;

    const gradeText = item.gradeLevel && item.section
      ? `${item.gradeLevel} - ${item.section}`
      : (item.grade || '—');

    const termName = item?.term?.name || '—';
    const termDates = item?.term?.startDate && item?.term?.endDate
      ? `${String(item.term.startDate).slice(0,10)} → ${String(item.term.endDate).slice(0,10)}`
      : null;

    const isDeleting = deletingId === item._id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>

          <View style={styles.headerRight}>
            <View style={[styles.roleChip, roleStyles(item.role)]}>
              <Text style={styles.roleText}>{item.role?.toUpperCase() || 'UNKNOWN'}</Text>
            </View>

            {!isProtectedAdmin && (
              <TouchableOpacity
                style={styles.trashBtn}
                onPress={() => confirmDelete(item)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <FontAwesome5 name="trash" size={14} color="#D7263D" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isStudent ? (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>Grade / Section</Text>
              <Text style={styles.value}>{gradeText}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Batch / Term</Text>
              <Text style={styles.value}>
                {termName}
                {termDates ? `\n${termDates}` : ''}
              </Text>
            </View>
          </>
        ) : null}
      </View>
    );
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      {/* Header (Ubuntu + same shape as AddTermScreen) */}
      <View style={styles.topHalf}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>User Management</Text>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <View style={styles.filtersHeader}>
          <Text style={styles.filtersTitle}>Users</Text>
          <Text style={styles.totalText}>Total: {total}</Text>
        </View>

        <TextInput
          style={styles.search}
          placeholder="Search name/email"
          value={q}
          onChangeText={setQ}
          placeholderTextColor="#9aa0a6"
        />

        <RNPickerSelect
          onValueChange={setRole}
          items={[
            { label: 'All roles', value: '' },
            { label: 'Student', value: 'student' },
            { label: 'Teacher', value: 'teacher' },
            { label: 'Admin', value: 'admin' },
          ]}
          value={role}
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
          onValueChange={setTerm}
          items={[{ label: 'All terms', value: '' }, ...(terms || []).map(t => ({ label: t.name, value: t._id }))]}
          value={term}
          useNativeAndroidPickerStyle={false}
          style={pickerSelectStyles}
          placeholder={{}}
        />

        <TouchableOpacity style={styles.refreshBtn} onPress={() => fetchUsers(true, 1)}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading && users.length === 0 ? (
        <View style={styles.loadingWrap}><ActivityIndicator /></View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderUser}
          contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 12 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            page < pages ? <ActivityIndicator style={{ marginVertical: 12 }} /> : null
          }
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#777', fontFamily: 'Ubuntu-Regular' }}>
              No users found.
            </Text>
          }
        />
      )}
    </View>
  );
};

const roleStyles = (role) => {
  if (role === 'admin') return { backgroundColor: '#222' };
  if (role === 'teacher') return { backgroundColor: '#0B6EFD' };
  return { backgroundColor: '#009F5D' }; // student
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },

  // Header (matches AddTermScreen)
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
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  backButton: { position: 'absolute', top: 59, left: 10, padding: 10, zIndex: 1 },
  pageTitle: { fontSize: 18, color: '#FFFFFF', fontFamily: 'Ubuntu-Bold' },

  /* Filters */
  filters: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6E8EB',
  },
  filtersHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  filtersTitle: { fontSize: 15, color: '#111', fontFamily: 'Ubuntu-Bold' },
  totalText: { fontSize: 12, color: '#444', fontFamily: 'Ubuntu-Regular' },
  search: {
    backgroundColor: '#F2F4F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    marginTop: 8,
    marginBottom: 8,
    fontFamily: 'Ubuntu-Regular',
    color: '#111',
  },
  refreshBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#006446',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  refreshText: { color: '#fff', fontFamily: 'Ubuntu-Bold' },

  /* Cards */
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6E8EB',
    position: 'relative',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 },
  name: { fontSize: 16, color: '#111', fontFamily: 'Ubuntu-Bold' },
  email: { color: '#555', marginTop: 2, fontFamily: 'Ubuntu-Regular' },
  headerRight: { alignItems: 'flex-end' },
  roleChip: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, alignSelf: 'flex-end' },
  roleText: { color: '#fff', fontFamily: 'Ubuntu-Bold', fontSize: 12 },

  trashBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#FCEDEF',
    borderRadius: 6,
    alignSelf: 'flex-end',
  },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  label: { color: '#444', fontFamily: 'Ubuntu-Regular' },
  value: { color: '#111', fontFamily: 'Ubuntu-Bold', textAlign: 'right' },

  loadingWrap: { paddingVertical: 24, alignItems: 'center' },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    color: '#333',
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    fontFamily: 'Ubuntu-Regular',
  },
  inputAndroid: {
    fontSize: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    color: '#333',
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    fontFamily: 'Ubuntu-Regular',
  },
  placeholder: {
    color: '#9aa0a6',
    fontFamily: 'Ubuntu-Regular',
  },
});

export default AdminUsersList;
