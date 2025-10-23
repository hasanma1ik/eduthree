// CreateClasses.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, StyleSheet, Alert, Text, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import axios from 'axios';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation } from '@react-navigation/native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import moment from 'moment-timezone';

// ====== SUBJECT SOURCE OF TRUTH ======
const FORCE_LOCAL_SUBJECTS = true;
const SUBJECTS_LOCAL = [
  'ENG/STEM','MATH','BIOLOGY','COMM DEVELOPMENT','Leadership - Mentor','Urdu','Liberal Arts',
  'CHEMISTRY','PHYSICS','CODING','ENGLISH','SCIENCE','ISLAMIAT','ICT','SST','ISL',
];
const toSubjectOptions = (names) =>
  Array.from(new Set((names || []).map(s => (s || '').trim()).filter(Boolean)))
    .map(name => ({ _id: name, name }));

// ----- Config: Grades & fallback Sections -----
const GRADES = ['KG-1','KG-2','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8'];
const FALLBACK_SECTIONS = ['A','B','C','D','E'];

const PRESET_TIME_SLOTS = [
  '7:00 AM - 8:00 AM','9:00 AM - 10:00 AM','10:00 AM - 11:00 AM','11:00 AM - 12:00 PM',
  '1:00 PM - 2:00 PM','2:00 PM - 3:00 PM','3:00 PM - 4:00 PM',
];
const CUSTOM_TIME = 'CUSTOM';
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

// ---------- small presentational row (no hooks) ----------
const SessionRow = ({ text, onRemove }) => (
  <View style={styles.sessionRow}>
    <Text style={styles.sessionText}>{text}</Text>
    <TouchableOpacity onPress={onRemove}>
      <Text style={{ color: 'red', fontFamily: 'Ubuntu-Bold' }}>Remove</Text>
    </TouchableOpacity>
  </View>
);

const CreateClasses = () => {
  const navigation = useNavigation();

  // Core selections
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  // Multi-session builder state
  const [tempDay, setTempDay] = useState('');
  const [tempSlot, setTempSlot] = useState('');
  const [tempCustomStart, setTempCustomStart] = useState('');
  const [tempCustomEnd, setTempCustomEnd] = useState('');
  const [sessions, setSessions] = useState([]); // [{ day, startUtc, endUtc, label }]

  // Data lists
  const [terms, setTerms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Section availability (based on Grade + Term)
  const [sectionChoices, setSectionChoices] = useState([]); // [{name, available, assignedTermName?}]
  const [sectionsLoading, setSectionsLoading] = useState(false);

  // Fonts
  const [fontsLoaded] = useFonts({ 'Ubuntu-Bold': require('../assets/fonts/Ubuntu-Bold.ttf') });

  // Effects
  useEffect(() => {
    const run = async () => {
      try {
        const [tch, trm] = await Promise.all([
          axios.get('/auth/teachers'),
          axios.get('/auth/terms'),
        ]);
        setTeachers(tch.data?.teachers || []);
        setTerms(trm.data?.terms || []);
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'Failed to load teachers/terms');
      }
      // subjects
      if (FORCE_LOCAL_SUBJECTS) {
        setSubjects(toSubjectOptions(SUBJECTS_LOCAL));
      } else {
        try {
          const res = await axios.get('/auth/subjects');
          const list = Array.isArray(res?.data?.subjects) ? res.data.subjects : [];
          if (list.length) {
            const normalized = list.map(s => ({
              _id: s?._id ?? s?.name ?? String(Math.random()),
              name: (s?.name || '').trim(),
            })).filter(s => s.name);
            setSubjects(normalized);
          } else {
            setSubjects(toSubjectOptions(SUBJECTS_LOCAL));
          }
        } catch (e) {
          console.warn('Subjects API failed. Using local list.', e?.message || e);
          setSubjects(toSubjectOptions(SUBJECTS_LOCAL));
        }
      }
    };
    run();
  }, []);

  // Load section availability whenever Grade or Term changes
  useEffect(() => {
    const loadSectionOptions = async () => {
      setSelectedSection(''); // reset current pick
      setSectionChoices([]);
      if (!selectedGrade || !selectedTerm) return;

      try {
        setSectionsLoading(true);
        // Adjust this URL to match your controller route
        const { data } = await axios.get('/auth/section-offerings/options', {
          params: { gradeLevel: selectedGrade, term: selectedTerm },
        });
        // Expecting data.sections: [{ name, available, assignedTermName? }]
        let list = Array.isArray(data?.sections) ? data.sections : [];

        if (list.length === 0) {
          list = FALLBACK_SECTIONS.map(s => ({ name: s, available: true }));
        }

        setSectionChoices(list);
      } catch (e) {
        console.error('Failed to load section options:', e?.response?.data || e.message);
        // fallback to generic list if API fails
        setSectionChoices(FALLBACK_SECTIONS.map(s => ({ name: s, available: true })));
      } finally {
        setSectionsLoading(false);
      }
    };

    loadSectionOptions();
  }, [selectedGrade, selectedTerm]);

  // Callbacks
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // Helpers
  const isValid12h = (t) => moment(t, ['h:mm A','hh:mm A','h:mm a','hh:mm a'], true).isValid();
  const toUtcHHmm = (localTime12h) => {
    const tz = moment.tz.guess();
    const m = moment.tz(localTime12h, ['h:mm A','hh:mm A','h:mm a','hh:mm a'], true, tz);
    return m.utc().format('HH:mm');
  };

  const addSession = () => {
    if (!tempDay) return Alert.alert('Validation', 'Select a day.');
    let startUtc = '', endUtc = '', label = '';

    if (tempSlot === CUSTOM_TIME) {
      if (!tempCustomStart || !tempCustomEnd) return Alert.alert('Validation', 'Enter custom start & end time.');
      if (!isValid12h(tempCustomStart) || !isValid12h(tempCustomEnd)) {
        return Alert.alert('Invalid Time', 'Use format like "9:15 AM".');
      }
      const s = moment(tempCustomStart, ['h:mm A','hh:mm A','h:mm a','hh:mm a'], true);
      const e = moment(tempCustomEnd,   ['h:mm A','hh:mm A','h:mm a','hh:mm a'], true);
      if (!s.isBefore(e)) return Alert.alert('Invalid Range', 'End must be after start.');
      startUtc = toUtcHHmm(tempCustomStart);
      endUtc   = toUtcHHmm(tempCustomEnd);
      label    = `${tempDay}: ${tempCustomStart} - ${tempCustomEnd}`;
    } else {
      if (!tempSlot) return Alert.alert('Validation', 'Pick a preset slot or choose Custom.');
      const [start, end] = tempSlot.split(' - ').map(s => s.trim());
      const fmt = 'h:mm A';
      const s = moment(start, fmt, true); const e = moment(end, fmt, true);
      if (!s.isValid() || !e.isValid() || !s.isBefore(e)) return Alert.alert('Invalid Slot', 'Pick a valid preset slot.');
      const tz = moment.tz.guess();
      startUtc = moment.tz(start, fmt, tz).utc().format('HH:mm');
      endUtc   = moment.tz(end,   fmt, tz).utc().format('HH:mm');
      label    = `${tempDay}: ${tempSlot}`;
    }

    setSessions(prev => [...prev, { day: tempDay, startUtc, endUtc, label }]);
    setTempDay(''); setTempSlot(''); setTempCustomStart(''); setTempCustomEnd('');
  };

  const removeSession = (idx) => setSessions(prev => prev.filter((_, i) => i !== idx));

  const createClass = async () => {
    if (!selectedGrade || !selectedTeacher || !selectedTerm) {
      return Alert.alert('Validation', 'Please fill grade, teacher and term.');
    }
    if (!selectedSection) {
      return Alert.alert('Validation', 'Please pick a section.');
    }
    if (sessions.length === 0) {
      return Alert.alert('Validation', 'Add at least one (day, time) session.');
    }

    // Ensure selected section is available for this Grade + Term
    const sec = sectionChoices.find(s => s.name === selectedSection);
    if (!sec) {
      return Alert.alert('Section', 'Selected section is not valid for this grade/term.');
    }
    if (sec.available === false) {
      const note = sec.assignedTermName ? ` (taken by ${sec.assignedTermName})` : '';
      return Alert.alert('Section Locked', `Section ${selectedSection} is not available${note}. Choose a different section.`);
    }

    try {
      const payload = {
        grade: `${selectedGrade} - ${selectedSection}`,
        gradeLevel: selectedGrade,
        section: selectedSection,
        subject: selectedSubject,
        teacher: selectedTeacher,
        term: selectedTerm,
        sessions: sessions.map(s => ({ day: s.day, startUtc: s.startUtc, endUtc: s.endUtc })),
        // legacy (keep first)
        day: sessions[0]?.day,
        timeSlot: `${sessions[0]?.startUtc} - ${sessions[0]?.endUtc}`,
      };

      await axios.post('/auth/grades', payload);
      Alert.alert('Success', 'Class created with multiple sessions.');

      // reset
      setSelectedGrade(''); setSelectedSection(''); setSelectedSubject('');
      setSelectedTeacher(''); setSelectedTerm(''); setSessions([]);
      setTempDay(''); setTempSlot(''); setTempCustomStart(''); setTempCustomEnd('');
      setSectionChoices([]);
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.message || 'An unexpected error occurred';
      Alert.alert('Error', msg);
    }
  };

  // >>> MOVE ALL HOOKS ABOVE ANY CONDITIONAL RETURNS <<<
  // Build items for Section picker with disabled/taken notes
  const sectionItems = useMemo(() => {
    if (!selectedGrade || !selectedTerm) {
      return FALLBACK_SECTIONS.map(s => ({ label: s, value: s, disabled: true }));
    }
    if (sectionsLoading) {
      return [{ label: 'Loading sections…', value: null, disabled: true }];
    }
    if (!sectionChoices.length) {
      return FALLBACK_SECTIONS.map(s => ({ label: s, value: s, disabled: false }));
    }
    return sectionChoices.map((s) => {
      const takenLabel = s.available ? '' : (s.assignedTermName ? ` (taken by ${s.assignedTermName})` : ' (taken)');
      return {
        label: `${s.name}${takenLabel}`,
        value: s.name,
        disabled: !s.available,
      };
    });
  }, [selectedGrade, selectedTerm, sectionChoices, sectionsLoading]);

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      {/* Header */}
      <View style={styles.topHalf}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Create Classes</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Grade */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Grade</Text>
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              onValueChange={(value) => { setSelectedGrade(value || ''); setSelectedSection(''); }}
              items={GRADES.map((g) => ({ label: g, value: g }))}
              placeholder={{ label: 'Select Grade', value: null }}
              style={pickerSelectStyles} useNativeAndroidPickerStyle={false}
              Icon={() => <Text style={styles.icon}>▼</Text>}
              value={selectedGrade}
            />
          </View>
        </View>

        {/* Term */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Term / Batch</Text>
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              onValueChange={(value) => { setSelectedTerm(value || ''); setSelectedSection(''); }}
              items={terms.map((t) => ({ label: t.name, value: t._id }))}
              placeholder={{ label: 'Select Term', value: null }}
              style={pickerSelectStyles} useNativeAndroidPickerStyle={false}
              Icon={() => <Text style={styles.icon}>▼</Text>}
              value={selectedTerm}
            />
          </View>
          {selectedGrade && !selectedTerm ? (
            <Text style={styles.helperText}>Pick a term to see which sections are available.</Text>
          ) : null}
        </View>

        {/* Section (locked by Term) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Section</Text>
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              onValueChange={(value) => setSelectedSection(value || '')}
              items={sectionItems}
              placeholder={{ label: selectedGrade ? 'Select Section' : 'Choose grade first', value: null }}
              disabled={!selectedGrade || !selectedTerm || sectionsLoading}
              style={pickerSelectStyles} useNativeAndroidPickerStyle={false}
              Icon={() => <Text style={styles.icon}>▼</Text>}
              value={selectedSection}
            />
          </View>
          {!!selectedGrade && !!selectedTerm && (
            <Text style={styles.legendText}>
              Sections marked “taken” are already assigned to another term and cannot be used.
            </Text>
          )}
        </View>

        {/* Subject */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Subject</Text>
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              onValueChange={(value) => setSelectedSubject(value)}
              items={subjects.map((s) => ({ label: s.name, value: s._id }))}
              placeholder={{ label: 'Select Subject', value: null }}
              style={pickerSelectStyles} useNativeAndroidPickerStyle={false}
              Icon={() => <Text style={styles.icon}>▼</Text>}
              value={selectedSubject}
            />
          </View>
        </View>

        {/* Teacher */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Teacher</Text>
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              onValueChange={(value) => setSelectedTeacher(value)}
              items={teachers.map((t) => ({ label: t.name, value: t._id }))}
              placeholder={{ label: 'Select Teacher', value: null }}
              style={pickerSelectStyles} useNativeAndroidPickerStyle={false}
              Icon={() => <Text style={styles.icon}>▼</Text>}
              value={selectedTeacher}
            />
          </View>
        </View>

        {/* --- Multi-session builder --- */}
        <Text style={[styles.label, { marginTop: 10 }]}>Add sessions (day & time):</Text>

        {/* Day picker */}
        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={(v) => setTempDay(v || '')}
            items={DAYS.map((d) => ({ label: d, value: d }))}
            placeholder={{ label: 'Select Day', value: null }}
            style={pickerSelectStyles} useNativeAndroidPickerStyle={false}
            Icon={() => <Text style={styles.icon}>▼</Text>}
            value={tempDay}
          />
        </View>

        {/* Time slot picker */}
        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={(v) => { setTempSlot(v || ''); if (v !== CUSTOM_TIME) { setTempCustomStart(''); setTempCustomEnd(''); } }}
            items={[
              ...PRESET_TIME_SLOTS.map((slot) => ({ label: slot, value: slot })),
              { label: 'Custom (enter times)', value: CUSTOM_TIME },
            ]}
            placeholder={{ label: 'Select Time Slot', value: null }}
            style={pickerSelectStyles} useNativeAndroidPickerStyle={false}
            Icon={() => <Text style={styles.icon}>▼</Text>}
            value={tempSlot}
          />
        </View>

        {/* Custom time inputs */}
        {tempSlot === CUSTOM_TIME && (
          <View style={{ marginTop: -10, marginBottom: 10 }}>
            <Text style={styles.smallLabel}>Custom Start</Text>
            <TextInput
              style={styles.textInput} placeholder="e.g., 8:00 AM" placeholderTextColor="#888"
              value={tempCustomStart} onChangeText={setTempCustomStart} autoCapitalize="characters"
            />
            <Text style={[styles.smallLabel, { marginTop: 8 }]}>Custom End</Text>
            <TextInput
              style={styles.textInput} placeholder="e.g., 9:00 AM" placeholderTextColor="#888"
              value={tempCustomEnd} onChangeText={setTempCustomEnd} autoCapitalize="characters"
            />
          </View>
        )}

        {/* Add session */}
        <TouchableOpacity style={[styles.button, { backgroundColor: '#444' }]} onPress={addSession}>
          <Text style={styles.buttonText}>Add Session</Text>
        </TouchableOpacity>

        {/* Sessions list */}
        {sessions.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.label}>Sessions:</Text>
            {sessions.map((s, idx) => (
              <SessionRow
                key={`${s.day}-${s.startUtc}-${s.endUtc}-${idx}`}
                text={`${s.label} (UTC ${s.startUtc} - ${s.endUtc})`}
                onRemove={() => removeSession(idx)}
              />
            ))}
          </View>
        )}

        {/* Create Class */}
        <TouchableOpacity style={styles.button} onPress={createClass}>
          <Text style={styles.buttonText}>Create Class</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16, paddingVertical: 12, paddingHorizontal: 10, borderWidth: 1, borderColor: 'white',
    borderRadius: 8, color: 'white', backgroundColor: '#333333', paddingRight: 30, fontFamily: 'Ubuntu-Bold', marginBottom: -20,
  },
  inputAndroid: {
    fontSize: 16, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: 'black',
    borderRadius: 8, color: 'black', backgroundColor: 'white', paddingRight: 30, fontFamily: 'Ubuntu-Bold', marginBottom: -20,
  },
  placeholder: { color: 'black', fontFamily: 'Ubuntu-Bold' },
});

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingBottom: 120, backgroundColor: '#F4F6F8' },
  topHalf: {
    width: 393, height: 128, backgroundColor: '#006446', alignSelf: 'center',
    borderTopLeftRadius: 35, borderTopRightRadius: 35, paddingHorizontal: 20, paddingTop: 30, paddingBottom: 10,
    marginTop: 30, alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  backButton: { position: 'absolute', top: 59, left: 10, padding: 10, zIndex: 1 },
  pageTitle: { fontSize: 18, color: '#FFFFFF', fontFamily: 'Ubuntu-Bold' },
  inputContainer: { marginBottom: 16 },
  pickerWrapper: { marginBottom: 35 },
  label: { fontSize: 16, color: '#333', fontFamily: 'Ubuntu-Bold', marginBottom: 5 },
  smallLabel: { fontSize: 14, color: '#333', fontFamily: 'Ubuntu-Bold', marginBottom: 5 },
  icon: { fontSize: 18, color: 'black', paddingRight: 10 },
  textInput: {
    borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#FFFFFF', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontFamily: 'Ubuntu-Bold', color: '#333',
  },
  button: {
    backgroundColor: '#006446', borderRadius: 8, paddingVertical: 15, justifyContent: 'center', alignItems: 'center',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 5, marginTop: 16,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Ubuntu-Bold' },
  sessionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8,
  },
  sessionText: { fontFamily: 'Ubuntu-Bold', color: '#333' },
  helperText: { color: '#666', fontFamily: 'Ubuntu-Bold', marginTop: -24, marginBottom: 8 },
  legendText: { color: '#666', fontFamily: 'Ubuntu-Bold', marginTop: -15, marginBottom: -2 },
});

export default CreateClasses;
