import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from './styles/global';

const HEADER_GREEN = colors.background;

/**
 * SettingsScreen
 * --------------
 * Placeholder — your hamburger menu already links here
 * (HamburgerMenuContent routes to '/settings'), so this exists to makesks * that link resolve instead of 404ing, with a layout consistent with the
 * rest of the app.
 *
 * NOTE: your file tree has a components/Settings.tsx already. If that
 * has real content you want here, swap the placeholder body below for
 * <Settings /> (imported from '../components/Settings') instead of
 * building this out from scratch.
 */
export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
          <Text style={styles.backText}>Back Home</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.placeholderWrapper}>
          <Ionicons name="settings-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.placeholderText}>Settings are coming soon.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: { paddingTop: 75, paddingHorizontal: 16, paddingBottom: 18 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backText: { fontSize: 16, color: '#fff' },

  body: { padding: 16, flex: 1 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 24 },

  placeholderWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 80,
  },
  placeholderText: { fontSize: 15, color: colors.textSecondary },
});
