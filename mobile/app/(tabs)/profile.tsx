import { useAuth } from '../../context/AuthContext';
import { logoutCurrentSession, updateMyProfile } from '../../lib/api';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const { session, setSession, logout } = useAuth();
  const router = useRouter();
  const user = session?.user;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function handleSave() {
    setError('');
    setSuccessMsg('');
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First and last name are required');
      return;
    }
    if (form.password && form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const updated = await updateMyProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        password: form.password || undefined,
      });
      if (session) setSession({ ...session, user: updated });
      setSuccessMsg('Profile updated successfully');
      setEditing(false);
      setForm((p) => ({ ...p, password: '' }));
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logoutCurrentSession();
          await logout();
        },
      },
    ]);
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Not signed in</Text>
          <Pressable style={styles.btn} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.btnText}>Sign In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.firstName[0]}{user.lastName[0]}
              </Text>
            </View>
            <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.phone}>{user.phoneNumber}</Text>
            <View style={[styles.roleBadge, user.role === 'ADMIN' && styles.adminBadge]}>
              <Text style={[styles.roleText, user.role === 'ADMIN' && styles.adminText]}>{user.role}</Text>
            </View>
          </View>

          {/* Messages */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {successMsg ? <Text style={styles.successText}>{successMsg}</Text> : null}

          {/* Edit form */}
          {editing ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Edit Profile</Text>
              <TextInput style={styles.input} placeholder="First name" placeholderTextColor={Colors.textMuted}
                value={form.firstName} onChangeText={(v) => setForm((p) => ({ ...p, firstName: v }))} color={Colors.text} />
              <TextInput style={styles.input} placeholder="Last name" placeholderTextColor={Colors.textMuted}
                value={form.lastName} onChangeText={(v) => setForm((p) => ({ ...p, lastName: v }))} color={Colors.text} />
              <TextInput style={styles.input} placeholder="New password (optional)" placeholderTextColor={Colors.textMuted}
                value={form.password} onChangeText={(v) => setForm((p) => ({ ...p, password: v }))} secureTextEntry color={Colors.text} />

              <View style={styles.btnRow}>
                <Pressable style={[styles.btn, { flex: 1, marginRight: 8 }]} onPress={handleSave} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save</Text>}
                </Pressable>
                <Pressable style={[styles.outlineBtn, { flex: 1 }]} onPress={() => setEditing(false)}>
                  <Text style={styles.outlineBtnText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.section}>
              <Pressable style={styles.btn} onPress={() => setEditing(true)}>
                <Text style={styles.btnText}>Edit Profile</Text>
              </Pressable>
            </View>
          )}

          {user.role === 'ADMIN' && (
            <View style={styles.section}>
              <Pressable style={styles.adminNavBtn} onPress={() => router.push('/(admin)/dashboard')}>
                <Text style={styles.adminNavBtnText}>⚙️ Admin Dashboard</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.section}>
            <Pressable style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>Sign Out</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  avatarSection: { alignItems: 'center', padding: 32, paddingBottom: 20 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', color: Colors.text },
  phone: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  roleBadge: {
    marginTop: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  adminBadge: { backgroundColor: '#FBBF24' + '33' },
  roleText: { color: Colors.primary, fontWeight: '700', fontSize: 12 },
  adminText: { color: '#B45309' },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: Colors.card,
    marginBottom: 12,
  },
  btnRow: { flexDirection: 'row' },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  outlineBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  outlineBtnText: { color: Colors.text, fontWeight: '600', fontSize: 15 },
  adminNavBtn: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  adminNavBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  logoutBtn: {
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutBtnText: { color: Colors.error, fontWeight: '700', fontSize: 15 },
  errorText: { color: Colors.error, marginHorizontal: 16, marginBottom: 12, fontSize: 13 },
  successText: { color: '#10B981', marginHorizontal: 16, marginBottom: 12, fontSize: 13 },
  emptyText: { color: Colors.textMuted, fontSize: 16, marginBottom: 24 },
});
