import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DatePickerField from '../components/DatePickerField';
import { colors, globalStyles } from '../styles/global';

const ACTIVE = '#4C7A3B';
const HEADER_GREEN = colors.primary;

type SummaryFormat = 'pdf' | 'xlsx';

export default function ReceiptsSummaryScreen() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [format, setFormat] = useState<SummaryFormat | null>(null);

  const handleGetSummary = () => {
    if (!startDate || !endDate) {
      Alert.alert('Missing dates', 'Choose a start and end date for the summary.');
      return;
    }
    if (!format) {
      Alert.alert('Missing format', 'Choose PDF or Excel for the summary.');
      return;
    }

    // TODO: wire this up to whatever actually builds the summary — pulling
    // matching receipts from storage, generating the file, and either
    // sharing/downloading it. This is just the input-gathering step.
    console.log('Generate summary', { startDate, endDate, format });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={globalStyles.backRowHeader}>
        <TouchableOpacity onPress={() => router.back()} style={globalStyles.backRow}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
          <Text style={styles.backText}>Back Home</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>Manage Receipts</Text>

        <Text style={styles.sectionTitle}>Generate Summary</Text>
        <Text style={styles.sectionDescription}>
          Choose a timeline for your summary and select a format you want it in
        </Text>

        <View style={styles.dateRow}>
          <View style={styles.dateFieldWrapper}>
            <DatePickerField
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              dropdownWidth={340}
              alwaysActive
            />
          </View>
          <View style={styles.dateFieldWrapper}>
            <DatePickerField
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              dropdownWidth={340}
              alwaysActive
            />
          </View>
        </View>

        <View style={styles.formatRow}>
          <TouchableOpacity
            style={[styles.formatButton, format === 'pdf' && styles.formatButtonSelected]}
            onPress={() => setFormat('pdf')}
            accessibilityLabel="PDF format"
          >
          
            <Ionicons name="document-text" size={30} color="#D32F2F" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.formatButton, format === 'xlsx' && styles.formatButtonSelected]}
            onPress={() => setFormat('xlsx')}
            accessibilityLabel="Excel format"
          >
            <Ionicons name="grid" size={28} color="#1D6F42" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.getSummaryButton} onPress={handleGetSummary}>
          <Text style={styles.getSummaryButtonText}>Get Summary</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary},
  content: { paddingBottom: 40 },

  header: { backgroundColor: HEADER_GREEN, paddingTop: 55, paddingHorizontal: 16, paddingBottom: 18 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backText: { fontSize: 16, color: '#fff' },

  body: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: ACTIVE, marginBottom: 6 },
  sectionDescription: { fontSize: 14, color: colors.blackText, lineHeight: 20, marginBottom: 20 },

  dateRow: { flexDirection: 'row', gap: 8, marginBottom: 40 },
  dateFieldWrapper: { flex: 1 },

  formatRow: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 40 },
  formatButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    // Subtle shadow so the circles lift off the background like the mock.
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  formatButtonSelected: { borderColor: ACTIVE },

  getSummaryButton: {
    backgroundColor: ACTIVE,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  getSummaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
