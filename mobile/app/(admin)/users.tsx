import {
  adminCreateUser,
  adminDeleteUser,
  adminGetUsers,
  adminUpdateUser,
  ManagedUser,
} from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { useEffect, useState } from 'react';
import PasswordInput from '../../components/PasswordInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

const EMPTY = { firstName: '', lastName: '', phoneNumber: '', password: '', role: 'CLIENT' as 'ADMIN' | 'CLIENT', isActive: true };

export default function AdminUsersScreen() {
  const { session } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      setUsers(await adminGetUsers());
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY });
    setShowForm(true);
    setError('');
  }

  function openEdit(u: ManagedUser) {
    setEditing(u);
    setForm({
      firstName: u.firstName,
      lastName: u.lastName,
      phoneNumber: u.phoneNumber,
      password: '',
      role: u.role,
      isActive: u.isActive,
    });
    setShowForm(true);
    setError('');
  }

  async function handleSave() {
    setError('');
    if (!form.firstName.trim() || !form.lastName.trim()) { setError('Full name required'); return; }
    if (!editing && !form.password) { setError('Password required for new users'); return; }
    if (!editing && form.password.length < 8) { setError('Password min 8 chars'); return; }
    if (!/^\d{10,15}$/.test(form.phoneNumber.trim())) { setError('Valid phone required (10-15 digits)'); return; }

    setSaving(true);
    try {
      if (editing) {
        const updated = await adminUpdateUser(editing.id, {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phoneNumber: form.phoneNumber.trim(),
          role: form.role,
          isActive: form.isActive,
        });
        setUsers((p) => p.map((u) => (u.id === editing.id ? updated : u)));
      } else {
        const created = await adminCreateUser({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phoneNumber: form.phoneNumber.trim(),
          password: form.password,
          role: form.role,
        });
        setUsers((p) => [created, ...p]);
      }
      setShowForm(false);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(u: ManagedUser) {
    if (u.id === session?.user.id) {
      Alert.alert('Cannot Delete', 'You cannot delete your own account');
      return;
    }
    Alert.alert('Delete User', `Delete ${u.firstName} ${u.lastName}?`, [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminDeleteUser(u.id);
            setUsers((p) => p.filter((x) => x.id !== u.id));
          } catch {
            Alert.alert('Error', 'Delete failed');
          }
        },
      },
    ]);
  }

  if (showForm) {
    return (
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.formContent}>
            <Text style={styles.formTitle}>{editing ? 'Edit User' : 'New User'}</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TextInput style={[styles.input, { color: Colors.text }]} placeholder="First name" placeholderTextColor={Colors.textMuted}
              value={form.firstName} onChangeText={(v) => setForm((p) => ({ ...p, firstName: v }))} />
            <TextInput style={[styles.input, { color: Colors.text }]} placeholder="Last name" placeholderTextColor={Colors.textMuted}
              value={form.lastName} onChangeText={(v) => setForm((p) => ({ ...p, lastName: v }))} />
            <TextInput style={[styles.input, { color: Colors.text }]} placeholder="Phone number" placeholderTextColor={Colors.textMuted}
              value={form.phoneNumber} onChangeText={(v) => setForm((p) => ({ ...p, phoneNumber: v }))} keyboardType="phone-pad" />
            {!editing ? (
              <PasswordInput
                containerStyle={{ backgroundColor: Colors.card, marginBottom: 12 }}
                placeholder="Password"
                value={form.password}
                onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
              />
            ) : null}

            <Text style={styles.inputLabel}>Role</Text>
            <View style={styles.roleRow}>
              {(['CLIENT', 'ADMIN'] as const).map((r) => (
                <Pressable
                  key={r}
                  style={[styles.roleChip, form.role === r && styles.roleChipActive]}
                  onPress={() => setForm((p) => ({ ...p, role: r }))}
                >
                  <Text style={[styles.roleChipText, form.role === r && styles.roleChipTextActive]}>{r}</Text>
                </Pressable>
              ))}
            </View>

            {editing && (
              <View style={styles.switchRow}>
                <Text style={styles.inputLabel}>Active</Text>
                <Switch value={form.isActive} onValueChange={(v) => setForm((p) => ({ ...p, isActive: v }))} trackColor={{ true: Colors.primary }} />
              </View>
            )}

            <View style={styles.btnRow}>
              <Pressable style={[styles.btn, { flex: 1, marginRight: 8 }]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save</Text>}
              </Pressable>
              <Pressable style={[styles.outlineBtn, { flex: 1 }]} onPress={() => setShowForm(false)}>
                <Text style={styles.outlineBtnText}>Cancel</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.count}>{users.length} users</Text>
        <Pressable style={styles.addBtn} onPress={openCreate}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>
      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.firstName[0]}{item.lastName[0]}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.phone}>{item.phoneNumber}</Text>
                <View style={styles.tagsRow}>
                  <View style={[styles.tag, item.role === 'ADMIN' && styles.adminTag]}>
                    <Text style={[styles.tagText, item.role === 'ADMIN' && styles.adminTagText]}>{item.role}</Text>
                  </View>
                  {!item.isActive && (
                    <View style={[styles.tag, styles.inactiveTag]}>
                      <Text style={styles.inactiveTagText}>INACTIVE</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.actions}>
                <Pressable style={styles.editBtn} onPress={() => openEdit(item)}>
                  <Text style={styles.editBtnText}>Edit</Text>
                </Pressable>
                <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                  <Text style={styles.deleteBtnText}>Del</Text>
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No users found</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
  count: { color: Colors.textMuted, fontSize: 14 },
  addBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  list: { padding: 12 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: Colors.text },
  phone: { fontSize: 13, color: Colors.textMuted, marginTop: 1 },
  tagsRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  tag: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  adminTag: { backgroundColor: '#FBBF24' + '33' },
  tagText: { color: Colors.primary, fontWeight: '700', fontSize: 10 },
  adminTagText: { color: '#B45309' },
  inactiveTag: { backgroundColor: '#EF444422' },
  inactiveTagText: { color: '#EF4444', fontWeight: '700', fontSize: 10 },
  actions: { gap: 6 },
  editBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  editBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 12 },
  deleteBtn: {
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deleteBtnText: { color: Colors.error, fontWeight: '600', fontSize: 12 },
  formContent: { padding: 20 },
  formTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 16 },
  inputLabel: { fontWeight: '700', color: Colors.text, fontSize: 13, marginBottom: 6, marginTop: 4 },
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
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  roleChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.card,
  },
  roleChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  roleChipText: { color: Colors.textMuted, fontWeight: '700', fontSize: 13 },
  roleChipTextActive: { color: '#fff' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  btnRow: { flexDirection: 'row', marginTop: 8 },
  btn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  outlineBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  outlineBtnText: { color: Colors.text, fontWeight: '600', fontSize: 15 },
  errorText: { color: Colors.error, marginBottom: 12, fontSize: 13 },
  emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 },
});
