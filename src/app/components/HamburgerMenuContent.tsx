import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/global';

const HEADER_GREEN = colors.hamburgerBG;

interface MenuItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Home', icon: 'home', route: '/' },
  { label: 'Receipt Summary', icon: 'reader-outline', route: '/receipts-summary' },
  { label: 'Settings', icon: 'settings-outline', route: '/settings' },
  { label: 'Help', icon: 'help-circle-outline', route: '/help' },
];

export default function HamburgerMenuContent({
  onClose,
  isLoggedIn = false,
}: {
  onClose: () => void;
  isLoggedIn?: boolean;
}) {
  const handleNavigate = (route: string) => {
    onClose();
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.brand}>Rceipt</Text>
        <TouchableOpacity
          onPress={onClose}
          accessibilityLabel="Close menu"
          style={styles.closeButton}
        >
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {!isLoggedIn && (
        <>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarEmoji}>🙂</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={() => handleNavigate('/login')}>
            <Text style={styles.loginButtonText}>LOG IN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signupButton} onPress={() => handleNavigate('/signup')}>
            <Text style={styles.signupButtonText}>SIGN UP</Text>
          </TouchableOpacity>
        </>
      )}

      <View style={styles.menuList}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={() => handleNavigate(item.route)}
          >
            <Ionicons name={item.icon} size={22} color="#fff" />
            <Text style={styles.menuItemText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HEADER_GREEN,
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  topRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 16,
    position: 'relative',
    minHeight: 32,
  },
  closeButton: { position: 'absolute', right: 0, top: 0 },
  brand: { fontSize: 24, fontWeight: '700', color: '#fff' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginBottom: 28 },

  avatarWrapper: { alignItems: 'center', marginBottom: 20 },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#D98C4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 40 },

  loginButton: {
    alignSelf: 'center',
    minWidth: 150,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 3,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 10,
  },
  loginButtonText: { color: '#fff', fontWeight: '700', letterSpacing: 1, fontSize: 13 },

  signupButton: {
    alignSelf: 'center',
    minWidth: 150,
    backgroundColor: '#fff',
    borderRadius: 3,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 40,
  },
  signupButtonText: { color: HEADER_GREEN, fontWeight: '700', letterSpacing: 1, fontSize: 13 },

  menuList: { gap: 28 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuItemText: { color: '#fff', fontSize: 19, fontWeight: '600' },
});
