import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FormInput from './components/FormInput';
import { colors } from './styles/global';

const ACTIVE = '#4C7A3B';
const HEADER_GREEN = colors.primary;

// Very light email shape check — not full RFC validation, just enough to
// catch "forgot to type an @" before hitting a (currently nonexistent)
// backend.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSendResetLink = () => {
    if (!email.trim() || !EMAIL_PATTERN.test(email.trim())) {
      Alert.alert('Invalid email', 'Enter a valid email address to continue.');
      return;
    }

    // TODO: wire this up to real password-reset logic once a backend/auth
    // provider exists (Firebase Auth, Supabase, your own API, etc). This
    // currently just simulates a successful request.
    console.log('Password reset requested for:', email.trim());
    setSubmitted(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <View style={styles.body}>
        {submitted ? (
          // ---- Success state ----
          <>
            <View style={styles.successIconWrapper}>
              <Ionicons name="mail-outline" size={40} color={ACTIVE} />
            </View>
            <Text style={styles.title}>Check Your Email</Text>
            <Text style={styles.description}>
              If an account exists for {email.trim()}, we&apos;ve sent a link to
              reset your password.
            </Text>

            <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/login')}>
              <Text style={styles.primaryButtonText}>BACK TO LOG IN</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSubmitted(false)} style={styles.resendRow}>
              <Text style={styles.switchLink}>Didn&apos;t get it? Try a different email</Text>
            </TouchableOpacity>
          </>
        ) : (
          // ---- Request form ----
          <>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.description}>
              Enter the email associated with your account and we&apos;ll send you
              a link to reset your password.
            </Text>

            <FormInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.primaryButton} onPress={handleSendResetLink}>
              <Text style={styles.primaryButtonText}>SEND RESET LINK</Text>
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Remember your password? </Text>
              <TouchableOpacity onPress={() => router.replace('/login')}>
                <Text style={styles.switchLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40, flexGrow: 1 },

  header: { backgroundColor: HEADER_GREEN, paddingTop: 55, paddingHorizontal: 16, paddingBottom: 18 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backText: { fontSize: 16, color: '#fff' },

  body: { padding: 16, flex: 1, paddingTop: 95 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 12 },
  description: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 24,
  },

  successIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E4EFDF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: ACTIVE,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },

  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  switchText: { fontSize: 14, color: colors.textSecondary },
  switchLink: { fontSize: 14, color: ACTIVE, fontWeight: '700' },

  resendRow: { alignItems: 'center', marginTop: 20 },
});
