import { adminCloseSession, adminGetScheduleRange, ManagedScheduleDay, openDaySession, upsertDaySchedule } from '../../lib/api';
import { Colors } from '../../constants/Colors';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const TODAY = new Date().toISOString().split('T')[0];

export default function AdminSessionScreen() {
  const [days, setDays] = useState<ManagedScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ManagedScheduleDay | null>(null);
  const [form, setForm] = useState({ startTime: '09:00', endTime: '18:00', slotDuration: '30' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function getNext14Days() {
    const start = TODAY;
    const end = new Date();
    end.setDate(end.getDate() + 13);
    return [start, end.toISOString().split('T')[0]] as [string, string];
  }

  async function load() {
    setLoading(true);
    try {
      const [start, end] = getNext14Days();
      setDays(await adminGetScheduleRange(start, end));
    } catch {
      setError('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleOpen(date: string) {
    try {
      await openDaySession(date);
      Alert.alert('Success', `Session opened for ${date}`);
      load();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to open session');
    }
  }

  async function handleClose(date: string) {
    Alert.alert('Close Session', `Close session for ${date}?`, [
      { text: 'Cancel' },
      {
        text: 'Close',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminCloseSession(date);
            load();
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Failed to close session');
          }
        },
      },
    ]);
  }

  async function handleSaveSchedule() {
    if (!editing) return;
    setSaving(true);
    setError('');
    try {
      await upsertDaySchedule({
        date: editing.date,
        status: 'OPEN',
        startTime: form.startTime,
        endTime: form.endTime,
        slotDurationMins: Number(form.slotDuration) || 30,
      });
      setEditing(null);
      load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function statusColor(status: ManagedScheduleDay['status']): string {
    switch (status) {
      case 'OPEN': return '#10B981';
      case 'CLOSED': return '#EF4444';
      default: return Colors.textMuted;
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          days.map((day) => (
            <View key={day.date} style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.date}>{day.date}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor(day.status) + '22' }]}>
                  <Text style={[styles.statusText, { color: statusColor(day.status) }]}>{day.status}</Text>
                </View>
              </View>
              <Text style={styles.timesText}>{day.startTime} – {day.endTime} · {day.slotDurationMins}min slots</Text>

              <View style={styles.actionRow}>
                {day.status !== 'OPEN' ? (
                  <Pressable style={styles.openBtn} onPress={() => handleOpen(day.date)}>
                    <Text style={styles.openBtnText}>Open</Text>
                  </Pressable>
                ) : (
                  <Pressable style={styles.closeBtn} onPress={() => handleClose(day.date)}>
                    <Text style={styles.closeBtnText}>Close</Text>
                  </Pressable>
                )}
                <Pressable
                  style={styles.editBtn}
                  onPress={() => {
                    setEditing(day);
                    setForm({
                      startTime: day.startTime,
                      endTime: day.endTime,
                      slotDuration: String(day.slotDurationMins),
                    });
                  }}
                >
                  <Text style={styles.editBtnText}>Edit Times</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        {/* Inline editor */}
        {editing && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Edit {editing.date}</Text>
            <TextInput style={styles.input} placeholder="Start time (HH:MM)" placeholderTextColor={Colors.textMuted}
              value={form.startTime} onChangeText={(v) => setForm((p) => ({ ...p, startTime: v }))} color={Colors.text} />
            <TextInput style={styles.input} placeholder="End time (HH:MM)" placeholderTextColor={Colors.textMuted}
              value={form.endTime} onChangeText={(v) => setForm((p) => ({ ...p, endTime: v }))} color={Colors.text} />
            <TextInput style={styles.input} placeholder="Slot duration (min)" placeholderTextColor={Colors.textMuted}
              value={form.slotDuration} onChangeText={(v) => setForm((p) => ({ ...p, slotDuration: v }))} keyboardType="numeric" color={Colors.text} />
            <View style={styles.btnRow}>
              <Pressable style={[styles.btn, { flex: 1, marginRight: 8 }]} onPress={handleSaveSchedule} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save</Text>}
              </Pressable>
              <Pressable style={[styles.outlineBtn, { flex: 1 }]} onPress={() => setEditing(null)}>
                <Text style={styles.outlineBtnText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1, padding: 16 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  date: { fontSize: 15, fontWeight: '700', color: Colors.text },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  timesText: { fontSize: 13, color: Colors.textMuted, marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 8 },
  openBtn: { flex: 1, backgroundColor: '#10B981', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  openBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  closeBtn: { flex: 1, borderWidth: 1, borderColor: '#EF4444', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  closeBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 13 },
  editBtn: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  editBtnText: { color: Colors.text, fontWeight: '600', fontSize: 13 },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: 16,
  },
  formTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: Colors.background,
    marginBottom: 12,
  },
  btnRow: { flexDirection: 'row' },
  btn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  outlineBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  outlineBtnText: { color: Colors.text, fontWeight: '600', fontSize: 15 },
  errorText: { color: Colors.error, marginBottom: 12, fontSize: 13 },
});
