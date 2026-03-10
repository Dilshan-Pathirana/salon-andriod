import {
  adminCloseSession,
  adminCompleteAppointment,
  adminDeleteAppointment,
  adminReorderQueue,
  getLiveQueue,
  LiveQueueItem,
  LiveQueueResponse,
} from '../../lib/api';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const TODAY = new Date().toISOString().split('T')[0];

function statusColor(status: LiveQueueItem['status']): string {
  switch (status) {
    case 'IN_SERVICE': return Colors.primary;
    case 'BOOKED': return '#F59E0B';
    case 'COMPLETED': return '#10B981';
    case 'CANCELLED': return '#EF4444';
    default: return Colors.textMuted;
  }
}

export default function AdminQueueScreen() {
  const [date, setDate] = useState(TODAY);
  const [queueData, setQueueData] = useState<LiveQueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState('');

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      setQueueData(await getLiveQueue(date));
    } catch {
      setError('Failed to load queue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, [date]);

  async function moveUp(index: number) {
    if (!queueData || index === 0) return;
    const queue = [...queueData.queue];
    [queue[index - 1], queue[index]] = [queue[index], queue[index - 1]];
    const updated = { ...queueData, queue };
    setQueueData(updated);
    setReordering(true);
    try {
      await adminReorderQueue(date, queue.map((q) => q.id));
    } catch {
      Alert.alert('Error', 'Reorder failed');
      load();
    } finally {
      setReordering(false);
    }
  }

  async function moveDown(index: number) {
    if (!queueData || index >= queueData.queue.length - 1) return;
    const queue = [...queueData.queue];
    [queue[index], queue[index + 1]] = [queue[index + 1], queue[index]];
    const updated = { ...queueData, queue };
    setQueueData(updated);
    setReordering(true);
    try {
      await adminReorderQueue(date, queue.map((q) => q.id));
    } catch {
      Alert.alert('Error', 'Reorder failed');
      load();
    } finally {
      setReordering(false);
    }
  }

  async function handleComplete(id: string, name: string) {
    Alert.alert('Complete', `Mark ${name} as complete?`, [
      { text: 'Cancel' },
      {
        text: 'Complete', onPress: async () => {
          try {
            await adminCompleteAppointment(id);
            setQueueData((prev) => prev ? {
              ...prev,
              queue: prev.queue.map((q) => q.id === id ? { ...q, status: 'COMPLETED' as const } : q),
            } : prev);
          } catch { Alert.alert('Error', 'Could not complete'); }
        },
      },
    ]);
  }

  async function handleDelete(id: string, name: string) {
    Alert.alert('Delete', `Remove ${name} from queue?`, [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await adminDeleteAppointment(id);
            setQueueData((prev) => prev ? {
              ...prev,
              queue: prev.queue.filter((q) => q.id !== id),
              totalInQueue: Math.max(0, (prev.totalInQueue || 1) - 1),
            } : prev);
          } catch { Alert.alert('Error', 'Delete failed'); }
        },
      },
    ]);
  }

  async function handleConcludeSession() {
    const remaining = queueData?.queue.filter(
      (q) => q.status === 'BOOKED' || q.status === 'IN_SERVICE'
    ) || [];

    const msg = remaining.length > 0
      ? `Complete ${remaining.length} remaining appointment(s) and close session for ${date}?`
      : `Close session for ${date}?`;

    Alert.alert('Conclude Session', msg, [
      { text: 'Cancel' },
      {
        text: 'Conclude', style: 'destructive', onPress: async () => {
          try {
            // Auto-complete all remaining active appointments first
            for (const item of remaining) {
              try { await adminCompleteAppointment(item.id); } catch { /* continue */ }
            }
            await adminCloseSession(date);
            const next = new Date(date + 'T00:00:00');
            next.setDate(next.getDate() + 1);
            setDate(next.toISOString().split('T')[0]);
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Failed');
          }
        },
      },
    ]);
  }

  const activeQueue = queueData?.queue.filter(
    (q) => q.status !== 'COMPLETED' && q.status !== 'CANCELLED'
  ) || [];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Date picker */}
      <View style={styles.topRow}>
        <TextInput
          style={[styles.dateInput, { color: Colors.text }]}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={Colors.textMuted}
        />
        <Pressable style={styles.todayBtn} onPress={() => setDate(TODAY)}>
          <Text style={styles.todayBtnText}>Today</Text>
        </Pressable>
        <Pressable style={styles.refreshBtn} onPress={() => load(true)}>
          <Ionicons name="refresh" size={18} color="#fff" />
        </Pressable>
      </View>

      {queueData?.currentlyServing && (
        <View style={styles.serving}>
          <Text style={styles.servingLabel}>NOW SERVING</Text>
          <Text style={styles.servingName}>{queueData.currentlyServing.name}</Text>
          <Text style={styles.servingTime}>{queueData.currentlyServing.timeSlot}</Text>
        </View>
      )}

      <View style={styles.statsRow}>
        <Text style={styles.subtitle}>{queueData?.totalInQueue ?? 0} in queue · {activeQueue.length} active</Text>
        <Pressable style={styles.concludeBtn} onPress={handleConcludeSession}>
          <Text style={styles.concludeBtnText}>Conclude Session</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={activeQueue}
        keyExtractor={(q) => q.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.primary} />}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={[styles.positionBubble, item.status === 'IN_SERVICE' && styles.positionBubbleActive]}>
                <Text style={[styles.positionText, item.status === 'IN_SERVICE' && { color: '#fff' }]}>{item.position}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.phoneNumber} · {item.timeSlot}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '22' }]}>
                  <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{item.status}</Text>
                </View>
              </View>
            </View>
            <View style={styles.actions}>
              <Pressable style={styles.arrowBtn} onPress={() => moveUp(index)} disabled={reordering || index === 0}>
                <Ionicons name="arrow-up" size={14} color={index === 0 ? Colors.textMuted : Colors.primary} />
              </Pressable>
              <Pressable
                style={styles.arrowBtn}
                onPress={() => moveDown(index)}
                disabled={reordering || index === activeQueue.length - 1}
              >
                <Ionicons name="arrow-down" size={14} color={index === activeQueue.length - 1 ? Colors.textMuted : Colors.primary} />
              </Pressable>
              <Pressable style={styles.completeBtn} onPress={() => handleComplete(item.id, item.name)}>
                <Text style={styles.completeBtnText}>Complete</Text>
              </Pressable>
              <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item.id, item.name)}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.emptyText}>Queue is empty for {date}</Text> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topRow: { flexDirection: 'row', padding: 12, gap: 8, alignItems: 'center', backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  dateInput: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, backgroundColor: Colors.background },
  todayBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  todayBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  refreshBtn: { backgroundColor: Colors.textMuted, borderRadius: 8, padding: 8 },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8 },
  subtitle: { fontSize: 13, color: Colors.textMuted },
  concludeBtn: { backgroundColor: Colors.danger, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  concludeBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  serving: {
    margin: 16,
    marginTop: 0,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
  },
  servingLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  servingName: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 2 },
  servingTime: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  list: { padding: 12 },
  card: { backgroundColor: Colors.card, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  positionBubble: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  positionBubbleActive: { backgroundColor: Colors.primary },
  positionText: { color: Colors.primary, fontWeight: '800', fontSize: 14 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: Colors.text },
  meta: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  statusBadge: { marginTop: 4, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 6 },
  arrowBtn: { width: 34, height: 32, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  completeBtn: { flex: 1, backgroundColor: Colors.success, borderRadius: 8, paddingVertical: 7, alignItems: 'center' },
  completeBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  deleteBtn: { flex: 1, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: Colors.danger, borderRadius: 8, paddingVertical: 7, alignItems: 'center' },
  deleteBtnText: { color: Colors.danger, fontWeight: '700', fontSize: 12 },
  errorText: { color: Colors.error, marginHorizontal: 16, marginBottom: 8, fontSize: 13 },
  emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 },
});
