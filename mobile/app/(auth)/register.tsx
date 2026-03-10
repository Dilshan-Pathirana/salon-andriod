import { useAuth } from '../../context/AuthContext';
import { registerClient } from '../../lib/api';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import PasswordInput from '../../components/PasswordInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function RegisterScreen() {
  const { setSession } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  async function handleRegister() {
    setError('');
    const { firstName, lastName, phone, password } = form;
    if (!firstName.trim()) { setError('First name is required'); return; }
    if (!lastName.trim()) { setError('Last name is required'); return; }
    if (!/^\d{10,15}$/.test(phone.trim())) { setError('Enter a valid phone number (10-15 digits)'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }

    setLoading(true);
    try {
      const session = await registerClient({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phone.trim(),
        password,
      });
      setSession(session);
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Registration failed';
      setError(msg.length > 100 ? 'Registration failed. Please try again.' : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us and book your appointments easily</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TextInput style={[styles.input, { color: Colors.text }]} placeholder="First name" placeholderTextColor={Colors.textMuted}
              value={form.firstName} onChangeText={(v) => update('firstName', v)} autoComplete="given-name" />
            <TextInput style={[styles.input, { color: Colors.text }]} placeholder="Last name" placeholderTextColor={Colors.textMuted}
              value={form.lastName} onChangeText={(v) => update('lastName', v)} autoComplete="family-name" />
            <TextInput style={[styles.input, { color: Colors.text }]} placeholder="Phone number" placeholderTextColor={Colors.textMuted}
              value={form.phone} onChangeText={(v) => update('phone', v)} keyboardType="phone-pad" autoComplete="tel" />
            <PasswordInput
              placeholder="Password (min 8 characters)"
              value={form.password}
              onChangeText={(v) => update('password', v)}
            />

            <Pressable style={[styles.btn, loading && styles.btnDisabled]} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
            </Pressable>

            <Pressable onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Sign In</Text></Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: 24, paddingTop: 40 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 32,
  },
  title: { fontSize: 26, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginBottom: 24 },
  errorText: { color: Colors.error, marginBottom: 12, fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: Colors.background,
    marginBottom: 14,
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { textAlign: 'center', color: Colors.textMuted, fontSize: 14 },
  linkBold: { color: Colors.primary, fontWeight: '600' },
});
