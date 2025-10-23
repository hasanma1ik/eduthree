// src/screen/AddTermScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useNavigation } from '@react-navigation/native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

SplashScreen.preventAutoHideAsync();

function AddTermScreen() {
  // Create term form
  const [term, setTerm] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Term list / management
  const [terms, setTerms] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editStart, setEditStart] = useState(new Date());
  const [editEnd, setEditEnd] = useState(new Date());
  const [showEditStartPicker, setShowEditStartPicker] = useState(false);
  const [showEditEndPicker, setShowEditEndPicker] = useState(false);

  const [fontsLoaded] = useFonts({
    'Ubuntu-Bold': require('../assets/fonts/Ubuntu-Bold.ttf'),
  });

  const navigation = useNavigation();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // Helpers
  const iso = (d) => new Date(d).toISOString().split('T')[0];
  const formatDate = (d) => new Date(d).toLocaleDateString();

  // Load terms
  const loadTerms = useCallback(async () => {
    try {
      setLoadingList(true);
      const res = await axios.get('/auth/terms');
      setTerms(res.data?.terms || []);
    } catch (e) {
      console.error('Failed to load terms:', e?.message || e);
      Alert.alert('Error', 'Failed to load terms');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadTerms();
  }, [loadTerms]);

  // Create term
  const handleSubmit = async () => {
    // Optional: auto-append current year if no 4-digit year exists in name
    const year = new Date().getFullYear();
    const termWithYear = /\d{4}/.test(term) ? term : `${term} ${year}`;

    if (!termWithYear.trim()) {
      Alert.alert('Validation', 'Please enter a term name.');
      return;
    }
    if (endDate < startDate) {
      Alert.alert('Validation', 'End date cannot be earlier than start date.');
      return;
    }

    try {
      await axios.post('/auth/terms', {
        name: termWithYear.trim(),
        startDate: iso(startDate),
        endDate: iso(endDate),
      });
      Alert.alert('Success', 'Term created successfully');
      setTerm('');
      setStartDate(new Date());
      setEndDate(new Date());
      loadTerms();
    } catch (error) {
      console.error('Error adding term:', error?.response?.data || error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to add term');
    }
  };

  // Start editing a term (inline)
  const beginEdit = (t) => {
    setEditingId(t._id);
    setEditName(t.name || '');
    setEditStart(new Date(t.startDate));
    setEditEnd(new Date(t.endDate));
    setShowEditStartPicker(false);
    setShowEditEndPicker(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditStart(new Date());
    setEditEnd(new Date());
    setShowEditStartPicker(false);
    setShowEditEndPicker(false);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editName.trim()) {
      Alert.alert('Validation', 'Please enter a term name.');
      return;
    }
    if (editEnd < editStart) {
      Alert.alert('Validation', 'End date cannot be earlier than start date.');
      return;
    }

    try {
      setSavingEdit(true);
      await axios.patch(`/auth/terms/${editingId}`, {
        name: editName.trim(),
        startDate: iso(editStart),
        endDate: iso(editEnd),
      });
      cancelEdit();
      loadTerms();
      Alert.alert('Success', 'Term updated successfully');
    } catch (e) {
      console.error('Failed to update term:', e?.response?.data || e);
      Alert.alert('Error', e?.response?.data?.message || 'Failed to update term');
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete term
  const confirmDelete = (t) => {
    Alert.alert(
      'Delete Term',
      `Are you sure you want to delete "${t.name}"?\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTerm(t._id) },
      ]
    );
  };

  const deleteTerm = async (id) => {
    try {
      setDeletingId(id);
      await axios.delete(`/auth/terms/${id}`);
      if (editingId === id) cancelEdit();
      loadTerms();
      Alert.alert('Deleted', 'Term deleted successfully');
    } catch (e) {
      console.error('Failed to delete term:', e?.response?.data || e);
      Alert.alert(
        'Error',
        e?.response?.data?.message ||
          'Failed to delete term. Make sure it has no linked classes or students.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      {/* Header */}
      <View style={styles.topHalf}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Terms / Batches</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Create Term */}
        <Text style={styles.sectionTitle}>Create New Term</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Term Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Jan 2025 - Dec 2025"
            placeholderTextColor="#999"
            value={term}
            onChangeText={setTerm}
          />
        </View>

        <TouchableOpacity
          onPress={() => setShowStartDatePicker(true)}
          style={styles.datePickerButton}
        >
          <Text style={styles.datePickerText}>Start Date: {formatDate(startDate)}</Text>
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              if (Platform.OS !== 'ios') setShowStartDatePicker(false);
              if (selectedDate) setStartDate(selectedDate);
            }}
          />
        )}

        <TouchableOpacity
          onPress={() => setShowEndDatePicker(true)}
          style={styles.datePickerButton}
        >
          <Text style={styles.datePickerText}>End Date: {formatDate(endDate)}</Text>
        </TouchableOpacity>
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              if (Platform.OS !== 'ios') setShowEndDatePicker(false);
              if (selectedDate) setEndDate(selectedDate);
            }}
          />
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Add Term</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Manage Terms */}
        <Text style={styles.sectionTitle}>Existing Terms</Text>

        {loadingList ? (
          <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator />
          </View>
        ) : terms.length === 0 ? (
          <Text style={{ color: '#666', marginBottom: 12 }}>
            No terms found. Create one above.
          </Text>
        ) : (
          terms.map((t) => {
            const isEditing = editingId === t._id;
            return (
              <View key={t._id} style={styles.termCard}>
                {/* Normal view */}
                {!isEditing ? (
                  <>
                    <View style={styles.termHeader}>
                      <Text style={styles.termName}>{t.name}</Text>
                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: '#0B6EFD' }]}
                          onPress={() => beginEdit(t)}
                        >
                          <Text style={styles.actionText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: '#D7263D' }]}
                          onPress={() => confirmDelete(t)}
                          disabled={deletingId === t._id}
                        >
                          <Text style={styles.actionText}>
                            {deletingId === t._id ? '...' : 'Delete'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.termDates}>
                      {iso(t.startDate)} → {iso(t.endDate)}
                    </Text>
                  </>
                ) : (
                  // Edit mode
                  <>
                    <Text style={styles.editTitle}>Edit Term</Text>

                    <Text style={styles.label}>Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Term name"
                      placeholderTextColor="#999"
                    />

                    <TouchableOpacity
                      onPress={() => setShowEditStartPicker(true)}
                      style={styles.datePickerButton}
                    >
                      <Text style={styles.datePickerText}>
                        Start Date: {formatDate(editStart)}
                      </Text>
                    </TouchableOpacity>
                    {showEditStartPicker && (
                      <DateTimePicker
                        value={editStart}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          if (Platform.OS !== 'ios') setShowEditStartPicker(false);
                          if (selectedDate) setEditStart(selectedDate);
                        }}
                      />
                    )}

                    <TouchableOpacity
                      onPress={() => setShowEditEndPicker(true)}
                      style={styles.datePickerButton}
                    >
                      <Text style={styles.datePickerText}>
                        End Date: {formatDate(editEnd)}
                      </Text>
                    </TouchableOpacity>
                    {showEditEndPicker && (
                      <DateTimePicker
                        value={editEnd}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          if (Platform.OS !== 'ios') setShowEditEndPicker(false);
                          if (selectedDate) setEditEnd(selectedDate);
                        }}
                      />
                    )}

                    <View style={styles.editActions}>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#6c757d', flex: 1 }]}
                        onPress={cancelEdit}
                        disabled={savingEdit}
                      >
                        <Text style={styles.actionText}>Cancel</Text>
                      </TouchableOpacity>
                      <View style={{ width: 10 }} />
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#006446', flex: 1 }]}
                        onPress={saveEdit}
                        disabled={savingEdit}
                      >
                        <Text style={styles.actionText}>
                          {savingEdit ? 'Saving...' : 'Save'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  scrollContainer: { padding: 20 },

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
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: { position: 'absolute', top: 59, left: 10, padding: 10, zIndex: 1 },
  pageTitle: { fontSize: 18, color: '#FFFFFF', fontFamily: 'Ubuntu-Bold' },

  // Create term form
  sectionTitle: {
    fontSize: 16,
    color: '#006446',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 10,
  },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontFamily: 'Ubuntu-Bold', color: '#34495E', marginBottom: 8 },
  textInput: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    color: '#34495E',
  },
  datePickerButton: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'black',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  datePickerText: { fontSize: 16, color: '#34495E', fontFamily: 'Ubuntu-Bold' },
  submitButton: {
    backgroundColor: '#006446',
    borderRadius: 8,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  submitButtonText: { color: '#FFF', fontSize: 18, fontFamily: 'Ubuntu-Bold' },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
  },

  // Term list styles
  termCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6E8EB',
  },
  termHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  termName: { fontFamily: 'Ubuntu-Bold', fontSize: 16, color: '#111' },
  termDates: {
    fontFamily: 'Ubuntu-Bold',
    color: '#444',
    marginTop: 8,
  },
  actionsRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionText: { color: '#fff', fontFamily: 'Ubuntu-Bold' },

  editTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 15,
    color: '#111',
    marginBottom: 8,
  },
  editActions: { flexDirection: 'row', marginTop: 8 },
});

export default AddTermScreen;
