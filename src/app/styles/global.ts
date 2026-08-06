import { StyleSheet } from 'react-native';

export const colors = {
  background: 'rgba(18, 86, 0, .9)',
  backgroundSecondary: '#ECECEC',
  backgroundLight: '#495A44',
  header: '#0F4800',
  headerSecondary: '#256B12',
  surface: '#2a2a4a',
  normalState: '#949494',
  borderActive: '#256B12',
  primary: '#E7FFB5',
  textPrimary: '#125600',
  buttonPrimary: '#256B12',
  text: '#ffffff',
  blackText: '#000000',
  textTetiary: '#256B12',
  textSecondary: '#E0E0E0',
  alert: '#ff5252',
  hamburgerBG: '#495A44',
};

export const globalStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textTetiary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 30,
    marginBottom: 16,
  },
  empty: {
    
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backRowHeader: {
    backgroundColor: colors.headerSecondary,
    paddingTop: 80,
    paddingHorizontal: 16,
    paddingBottom: 35,
  },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});