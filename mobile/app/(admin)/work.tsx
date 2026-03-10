import {
  adminCreateWorkItem,
  adminDeleteWorkItem,
  adminGetWorkItems,
  adminUpdateWorkItem,
  ManagedWorkItem,
} from '../../lib/api';
import { Colors } from '../../constants/Colors';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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

const EMPTY = { topic: '', description: '', beforeImageUrl: '', afterImageUrl: '' };

export default function AdminWorkScreen() {
  const [items, setItems] = useState<ManagedWorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ManagedWorkItem | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      setItems(await adminGetWorkItems());
    } catch {
      setError('Failed to load work items');
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

  function openEdit(item: ManagedWorkItem) {
    setEditing(item);
    setForm({
      topic: item.topic,
      description: item.description,
      beforeImageUrl: item.beforeImageUrl,
      afterImageUrl: item.afterImageUrl,
    });
    setShowForm(true);
    setError('');
  }

  async function handleSave() {
    setError('');
    if (!form.topic.trim()) { setError('Topic is required'); return; }
    if (!form.beforeImageUrl.trim() || !form.afterImageUrl.trim()) { setError('Before and after image URLs are required'); return; }

    setSaving(true);
    try {
      if (editing) {
        const updated = await adminUpdateWorkItem(editing.id, form);
        setItems((p) => p.map((x) => (x.id === editing.id ? updated : x)));
      } else {
        const created = await adminCreateWorkItem(form);
        setItems((p) => [created, ...p]);
      }
      setShowForm(false);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, topic: string) {
    Alert.alert('Delete', `Delete "${topic}"?`, [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminDeleteWorkItem(id);
            setItems((p) => p.filter((x) => x.id !== id));
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
            <Text style={styles.formTitle}>{editing ? 'Edit Work Item' : 'New Work Item'}</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TextInput style={styles.input} placeholder="Topic / title" placeholderTextColor={Colors.textMuted}
              value={form.topic} onChangeText={(v) => setForm((p) => ({ ...p, topic: v }))} color={Colors.text} />
            <TextInput style={[styles.input, { height: 80 }]} placeholder="Description" placeholderTextColor={Colors.textMuted}
              value={form.description} onChangeText={(v) => setForm((p) => ({ ...p, description: v }))} multiline color={Colors.text} />
            <TextInput style={styles.input} placeholder="Before image URL" placeholderTextColor={Colors.textMuted}
              value={form.beforeImageUrl} onChangeText={(v) => setForm((p) => ({ ...p, beforeImageUrl: v }))} color={Colors.text} />
            <TextInput style={styles.input} placeholder="After image URL" placeholderTextColor={Colors.textMuted}
              value={form.afterImageUrl} onChangeText={(v) => setForm((p) => ({ ...p, afterImageUrl: v }))} color={Colors.text} />

            {form.beforeImageUrl ? (
              <Image source={{ uri: form.beforeImageUrl }} style={styles.preview} resizeMode="cover" />
            ) : null}
            {form.afterImageUrl ? (
              <Image source={{ uri: form.afterImageUrl }} style={styles.preview} resizeMode="cover" />
            ) : null}

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
        <Text style={styles.count}>{items.length} items</Text>
        <Pressable style={styles.addBtn} onPress={openCreate}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(x) => x.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.imagesRow}>
                <Image source={{ uri: item.beforeImageUrl }} style={styles.thumb} />
                <Image source={{ uri: item.afterImageUrl }} style={styles.thumb} />
              </View>
              <Text style={styles.topic}>{item.topic}</Text>
              <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
              <View style={styles.actionRow}>
                <Pressable style={styles.editBtn} onPress={() => openEdit(item)}>
                  <Text style={styles.editBtnText}>Edit</Text>
                </Pressable>
                <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item.id, item.topic)}>
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No work items yet</Text>}
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
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imagesRow: { flexDirection: 'row' },
  thumb: { flex: 1, height: 120, backgroundColor: Colors.border },
  topic: { padding: 12, paddingBottom: 4, fontSize: 15, fontWeight: '700', color: Colors.text },
  description: { paddingHorizontal: 12, paddingBottom: 10, fontSize: 13, color: Colors.textMuted },
  actionRow: { flexDirection: 'row', padding: 12, paddingTop: 0, gap: 8 },
  editBtn: { flex: 1, borderWidth: 1, borderColor: Colors.primary, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  editBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 13 },
  deleteBtn: { flex: 1, borderWidth: 1, borderColor: Colors.error, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  deleteBtnText: { color: Colors.error, fontWeight: '600', fontSize: 13 },
  formContent: { padding: 20 },
  formTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 16 },
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
  preview: { width: '100%', height: 160, borderRadius: 10, marginBottom: 12 },
  btnRow: { flexDirection: 'row', marginTop: 8 },
  btn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  outlineBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  outlineBtnText: { color: Colors.text, fontWeight: '600', fontSize: 15 },
  errorText: { color: Colors.error, marginBottom: 12, fontSize: 13 },
  emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 },
});
