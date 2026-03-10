import { adminCreateReservedAppointment, adminGetScheduleRange, ManagedScheduleDay, upsertDaySchedule } from '../../lib/api';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const TODAY = new Date().toISOString().split('T')[0];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function get30Days(): string[] {
  const result: string[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    result.push(d.toISOString().split('T')[0]);
  }
  return result;
}

function computeSlots(startTime: string, endTime: string, slotMins: number): string[] {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return [];
  const startTotal = sh * 60 + sm;
  const endTotal = eh * 60 + em;
  if (startTotal >= endTotal || slotMins < 5) return [];
  const slots: string[] = [];
  for (let t = startTotal; t + slotMins <= endTotal; t += slotMins) {
    const h = Math.floor(t / 60).toString().padStart(2, '0');
    const m = (t % 60).toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
  }
  return slots;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

type DayStatus = 'uninitiated' | 'OPEN' | 'CLOSED' | 'HOLIDAY';

function statusColor(status: DayStatus): string {
  switch (status) {
    case 'OPEN': return '#10B981';
    case 'CLOSED': return '#111827';
    case 'HOLIDAY': return '#F59E0B';
    default: return '#94A3B8';
  }
}

const DAYS_LIST = get30Days();

export default function AdminSessionScreen() {
  const [scheduleMap, setScheduleMap] = useState<Record<string, ManagedScheduleDay>>({});
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [form, setForm] = useState({ startTime: '09:00', endTime: '18:00', slotDuration: '30' });
  const [reservedSlots, setReservedSlots] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await adminGetScheduleRange(DAYS_LIST[0], DAYS_LIST[DAYS_LIST.length - 1]);
      const map: Record<string, ManagedScheduleDay> = {};
      data.forEach((d) => { map[d.date] = d; });
      setScheduleMap(map);
    } catch {
      // silent – map stays empty
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openDay(date: string) {
    if (expandedDate === date) {
      setExpandedDate(null);
      return;
    }
    const existing = scheduleMap[date];
    setForm({
      startTime: existing?.startTime || '09:00',
      endTime: existing?.endTime || '18:00',
      slotDuration: String(existing?.slotDurationMins || 30),
    });
    setReservedSlots([]);
    setFormError('');
    setExpandedDate(date);
  }

  function toggleReserved(slot: string) {
    setReservedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : prev.length >= 2 ? prev : [...prev, slot]
    );
  }

  async function handleSave(date: string, status: 'OPEN' | 'CLOSED') {
    const slotMins = Number(form.slotDuration) || 30;
    setFormError('');
    setSaving(true);
    try {
      await upsertDaySchedule({
        date,
        status,
        startTime: form.startTime,
        endTime: form.endTime,
        slotDurationMins: slotMins,
      });
      for (const slot of reservedSlots) {
        try { await adminCreateReservedAppointment({ date, timeSlot: slot }); } catch { /* non-fatal */ }
      }
      setExpandedDate(null);
      await load();
    } catch (e: any) {
      setFormError(e?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Session Management</Text>
        <Text style={styles.subheading}>Next 30 days · tap a day to configure</Text>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          DAYS_LIST.map((date) => {
            const record = scheduleMap[date];
            const status: DayStatus = record ? (record.status as DayStatus) : 'uninitiated';
            const isExpanded = expandedDate === date;
            const isToday = date === TODAY;
            const slotMins = Number(form.slotDuration) || 30;
            const computedSlots = isExpanded ? computeSlots(form.startTime, form.endTime, slotMins) : [];

            return (
              <View key={date}>
                {/* Day row */}
                <Pressable
                  style={[styles.dayCard, isExpanded && styles.dayCardOpen]}
                  onPress={() => openDay(date)}
                >
                  <View style={[styles.statusBar, { backgroundColor: statusColor(status) }]} />
                  <View style={styles.dayInfo}>
                    <Text style={styles.dateLabel}>
                      {formatDate(date)}{isToday ? '  Today' : ''}
                    </Text>
                    <Text style={styles.timeHint}>
                      {record
                        ? `${record.startTime} – ${record.endTime} · ${record.slotDurationMins}min slots`
                        : 'No schedule set'}
                    </Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: statusColor(status) + '20' }]}>
                    <Text style={[styles.statusPillText, { color: statusColor(status) }]}>
                      {status === 'uninitiated' ? 'Not Set' : status}
                    </Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={Colors.textMuted}
                    style={{ marginLeft: 6 }}
                  />
                </Pressable>

                {/* Expanded setup form */}
                {isExpanded && (
                  <View style={styles.form}>
                    {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

                    <Text style={styles.sectionLabel}>Schedule Times</Text>
                    <View style={styles.timeRow}>
                      <View style={styles.timeField}>
                        <Text style={styles.fieldLabel}>Start</Text>
                        <TextInput
                          style={[styles.input, { color: Colors.text }]}
                          value={form.startTime}
                          onChangeText={(v) => { setForm((p) => ({ ...p, startTime: v })); setReservedSlots([]); }}
                          placeholder="09:00"
                          placeholderTextColor={Colors.textMuted}
                        />
                      </View>
                      <View style={styles.timeField}>
                        <Text style={styles.fieldLabel}>End</Text>
                        <TextInput
                          style={[styles.input, { color: Colors.text }]}
                          value={form.endTime}
                          onChangeText={(v) => { setForm((p) => ({ ...p, endTime: v })); setReservedSlots([]); }}
                          placeholder="18:00"
                          placeholderTextColor={Colors.textMuted}
                        />
                      </View>
                      <View style={styles.timeField}>
                        <Text style={styles.fieldLabel}>Slot (min)</Text>
                        <TextInput
                          style={[styles.input, { color: Colors.text }]}
                          value={form.slotDuration}
                          onChangeText={(v) => { setForm((p) => ({ ...p, slotDuration: v })); setReservedSlots([]); }}
                          placeholder="30"
                          placeholderTextColor={Colors.textMuted}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>

                    {/* Reserved slot picker */}
                    {computedSlots.length > 0 && (
                      <>
                        <Text style={styles.sectionLabel}>
                          Reserve Slots
                          <Text style={styles.sectionHint}>  optional · max 2 · {reservedSlots.length}/2 selected</Text>
                        </Text>
                        <View style={styles.slotGrid}>
                          {computedSlots.map((slot) => {
                            const isReserved = reservedSlots.includes(slot);
                            const isMaxed = reservedSlots.length >= 2 && !isReserved;
                            return (
                              <Pressable
                                key={slot}
                                style={[
                                  styles.slotChip,
                                  isReserved && styles.slotChipSelected,
                                  isMaxed && styles.slotChipMaxed,
                                ]}
                                onPress={() => !isMaxed && toggleReserved(slot)}
                                disabled={isMaxed}
                              >
                                <Text style={[styles.slotChipText, isReserved && styles.slotChipTextSelected]}>
                                  {slot}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </>
                    )}

                    {computedSlots.length === 0 && form.startTime && form.endTime && (
                      <Text style={styles.noSlotsHint}>Enter valid times to preview slots</Text>
                    )}

                    {/* Action buttons */}
                    <View style={styles.actionRow}>
                      <Pressable
                        style={[styles.openBtn, saving && { opacity: 0.6 }]}
                        onPress={() => handleSave(date, 'OPEN')}
                        disabled={saving}
                      >
                        {saving ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <>
                            <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                            <Text style={styles.openBtnText}>Mark as Open</Text>
                          </>
                        )}
                      </Pressable>
                      <Pressable
                        style={[styles.closeBtn, saving && { opacity: 0.6 }]}
                        onPress={() => handleSave(date, 'CLOSED')}
                        disabled={saving}
                      >
                        <Ionicons name="close-circle-outline" size={16} color="#fff" />
                        <Text style={styles.closeBtnText}>Mark as Closed</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  heading: { fontSize: 22, fontWeight: '800', color: Colors.text, marginHorizontal: 16, marginTop: 16 },
  subheading: { fontSize: 13, color: Colors.textMuted, marginHorizontal: 16, marginTop: 2, marginBottom: 12 },

  // Day card
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 12,
    marginBottom: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  dayCardOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  statusBar: { width: 4, alignSelf: 'stretch' },
  dayInfo: { flex: 1, paddingVertical: 12, paddingHorizontal: 12 },
  dateLabel: { fontSize: 14, fontWeight: '700', color: Colors.text },
  timeHint: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  statusPill: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginRight: 4 },
  statusPillText: { fontSize: 11, fontWeight: '700' },

  // Setup form
  form: {
    backgroundColor: Colors.card,
    marginHorizontal: 12,
    marginBottom: 6,
    borderRadius: 12,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    padding: 14,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.border,
  },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: Colors.text, marginTop: 10, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionHint: { fontSize: 11, fontWeight: '400', color: Colors.textMuted, textTransform: 'none', letterSpacing: 0 },
  timeRow: { flexDirection: 'row', gap: 8 },
  timeField: { flex: 1 },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: Colors.background,
    textAlign: 'center',
  },

  // Slot chips
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  slotChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  slotChipSelected: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  slotChipMaxed: { opacity: 0.3 },
  slotChipText: { fontSize: 12, fontWeight: '600', color: Colors.text },
  slotChipTextSelected: { color: '#fff' },
  noSlotsHint: { fontSize: 12, color: Colors.textMuted, marginBottom: 8, fontStyle: 'italic' },

  // Action buttons
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  openBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  openBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  closeBtn: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  closeBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  errorText: { color: Colors.danger, fontSize: 12, marginBottom: 8 },
});
