import {
  adminCreateService,
  adminDeleteService,
  adminGetServices,
  adminUpdateService,
  ManagedService,
} from '../../lib/api';
import { Colors } from '../../constants/Colors';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

const CATEGORIES = ['HAIRCUT', 'BEARD', 'COMBO', 'PREMIUM'] as const;
type Category = (typeof CATEGORIES)[number];

const EMPTY = {
  name: '',
  description: '',
  duration: '30',
  price: '',
  category: 'HAIRCUT' as Category,
  isActive: true,
};

export default function AdminServicesScreen() {
  const [services, setServices] = useState<ManagedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ManagedService | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      setServices(await adminGetServices());
    } catch {
      setError('Failed to load services');
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

  function openEdit(s: ManagedService) {
    setEditing(s);
    setForm({
      name: s.name,
      description: s.description || '',
      duration: String(s.duration),
      price: String(s.price),
      category: s.category as Category,
      isActive: s.isActive,
    });
    setShowForm(true);
    setError('');
  }

  async function handleSave() {
    setError('');
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.price) { setError('Price is required'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        duration: Number(form.duration) || 30,
        price: Number(form.price),
        category: form.category,
        isActive: form.isActive,
      };
      if (editing) {
        const updated = await adminUpdateService(editing.id, payload);
        setServices((p) => p.map((s) => (s.id === editing.id ? updated : s)));
      } else {
        const created = await adminCreateService(payload);
        setServices((p) => [created, ...p]);
      }
      setShowForm(false);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(s: ManagedService) {
    Alert.alert('Delete Service', `Delete "${s.name}"?`, [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminDeleteService(s.id);
            setServices((p) => p.filter((x) => x.id !== s.id));
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
            <Text style={styles.formTitle}>{editing ? 'Edit Service' : 'New Service'}</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TextInput style={styles.input} placeholder="Service name" placeholderTextColor={Colors.textMuted}
              value={form.name} onChangeText={(v) => setForm((p) => ({ ...p, name: v }))} color={Colors.text} />
            <TextInput style={[styles.input, { height: 80 }]} placeholder="Description" placeholderTextColor={Colors.textMuted}
              value={form.description} onChangeText={(v) => setForm((p) => ({ ...p, description: v }))} multiline color={Colors.text} />
            <TextInput style={styles.input} placeholder="Price (Rs.)" placeholderTextColor={Colors.textMuted}
              value={form.price} onChangeText={(v) => setForm((p) => ({ ...p, price: v }))} keyboardType="numeric" color={Colors.text} />
            <TextInput style={styles.input} placeholder="Duration (min)" placeholderTextColor={Colors.textMuted}
              value={form.duration} onChangeText={(v) => setForm((p) => ({ ...p, duration: v }))} keyboardType="numeric" color={Colors.text} />

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoriesRow}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  style={[styles.catChip, form.category === c && styles.catChipActive]}
                  onPress={() => setForm((p) => ({ ...p, category: c }))}
                >
                  <Text style={[styles.catChipText, form.category === c && styles.catChipTextActive]}>{c}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.inputLabel}>Active</Text>
              <Switch value={form.isActive} onValueChange={(v) => setForm((p) => ({ ...p, isActive: v }))} trackColor={{ true: Colors.primary }} />
            </View>

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
        <Text style={styles.count}>{services.length} services</Text>
        <Pressable style={styles.addBtn} onPress={openCreate}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>
      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <View style={[styles.activeDot, { backgroundColor: item.isActive ? '#10B981' : '#EF4444' }]} />
              </View>
              <Text style={styles.serviceMeta}>Rs. {item.price} · {item.duration} min · {item.category}</Text>
              <View style={styles.actionRow}>
                <Pressable style={styles.editBtn} onPress={() => openEdit(item)}>
                  <Text style={styles.editBtnText}>Edit</Text>
                </Pressable>
                <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No services found</Text>}
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
  list: { padding: 16 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  serviceName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  activeDot: { width: 10, height: 10, borderRadius: 5 },
  serviceMeta: { fontSize: 13, color: Colors.textMuted, marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 8 },
  editBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
  },
  editBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 13 },
  deleteBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
  },
  deleteBtnText: { color: Colors.error, fontWeight: '600', fontSize: 13 },
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
  categoriesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipText: { color: Colors.textMuted, fontWeight: '600', fontSize: 13 },
  catChipTextActive: { color: '#fff' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  btnRow: { flexDirection: 'row', marginTop: 8 },
  btn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  outlineBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  outlineBtnText: { color: Colors.text, fontWeight: '600', fontSize: 15 },
  errorText: { color: Colors.error, marginBottom: 12, fontSize: 13 },
  emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 },
});
