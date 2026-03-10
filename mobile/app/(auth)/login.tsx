import { useAuth } from '../../context/AuthContext';
import { loginWithPhone } from '../../lib/api';
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
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function LoginScreen() {
  const { setSession } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    if (!phone.trim()) { setError('Phone number is required'); return; }
    if (!password) { setError('Password is required'); return; }

    setLoading(true);
    try {
      const session = await loginWithPhone(phone.trim(), password);
      setSession(session);
      if (session.user.role === 'ADMIN') {
        router.replace('/(admin)/dashboard');
      } else {
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Login failed';
      setError(msg.length > 100 ? 'Invalid credentials. Please try again.' : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor={Colors.textMuted}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            autoComplete="tel"
          />
          <PasswordInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Sign In</Text>
            )}
          </Pressable>

          <Pressable onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.link}>Don't have an account? <Text style={styles.linkBold}>Register</Text></Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
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
    color: Colors.text,
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
