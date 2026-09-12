import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FormInput from './components/FormInput';
import { colors } from './styles/global';

const ACTIVE = '#4C7A3B';
const HEADER_GREEN = colors.primary;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing info', 'Enter your email and password to log in.');
      return;
    }

    // TODO: wire this up to real authentication once a backend/auth
    // provider exists (Firebase Auth, Supabase, your own API, etc). This
    // currently just simulates a successful login and returns home.
    console.log('Log in attempt:', { email });
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.body}>
        <Text style={styles.title}>Log In</Text>

        <FormInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <FormInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          isPassword
        />

        {/* NOTE: no forgot-password screen exists yet — this will 404
            under expo-router until app/forgot-password.tsx is created.
            Left in since it's a standard part of a login screen, but
            flagging it now rather than letting it silently dead-end. */}
        <TouchableOpacity onPress={() => router.push('/forgot-password')}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>LOG IN</Text>
        </TouchableOpacity>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/signup')}>
            <Text style={styles.switchLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40, flexGrow: 1 },

  header: { backgroundColor:colors.background, paddingTop: 55, paddingHorizontal: 16, paddingBottom: 18 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backText: { fontSize: 16, color: '#fff' },

  body: { padding: 16, paddingTop: 95, flex: 1 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 24 },

  forgotText: {
    fontSize: 13,
    color: ACTIVE,
    fontWeight: '600',
    alignSelf: 'flex-end',
    marginBottom: 24,
  },

  primaryButton: {
    backgroundColor: ACTIVE,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  switchText: { fontSize: 14, color: colors.textSecondary },
  switchLink: { fontSize: 14, color: ACTIVE, fontWeight: '700' },
});
