import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FormInput from './components/FormInput';
import { colors } from './styles/global';

const ACTIVE = '#4C7A3B';
const HEADER_GREEN = colors.primary;

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = () => {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Missing info', 'Fill in your name, email, and password to continue.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords don\u2019t match', 'Make sure both password fields match.');
      return;
    }

    // TODO: wire this up to real account creation once a backend/auth
    // provider exists. This currently just simulates a successful signup
    // and returns home.
    console.log('Sign up attempt:', { fullName, email });
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <View style={styles.body}>
        <Text style={styles.title}>Sign Up</Text>

        <FormInput label="Full Name" value={fullName} onChangeText={setFullName} />
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
        <FormInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
          isPassword
        />

        <TouchableOpacity style={[styles.primaryButton, { marginTop: 12 }]} onPress={handleSignUp}>
          <Text style={styles.primaryButtonText}>SIGN UP</Text>
        </TouchableOpacity>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={styles.switchLink}>Log In</Text>
          </TouchableOpacity>
        </View>
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
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 24 },

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
