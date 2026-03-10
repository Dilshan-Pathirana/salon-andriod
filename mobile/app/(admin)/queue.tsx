import { adminReorderQueue, getLiveQueue, LiveQueueItem, LiveQueueResponse } from '../../lib/api';
import { Colors } from '../../constants/Colors';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
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
  const [queueData, setQueueData] = useState<LiveQueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState('');

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      setQueueData(await getLiveQueue(TODAY));
    } catch {
      setError('Failed to load queue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function moveUp(index: number) {
    if (!queueData || index === 0) return;
    const queue = [...queueData.queue];
    [queue[index - 1], queue[index]] = [queue[index], queue[index - 1]];
    const updated = { ...queueData, queue };
    setQueueData(updated);
    setReordering(true);
    try {
      await adminReorderQueue(TODAY, queue.map((q) => q.id));
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
      await adminReorderQueue(TODAY, queue.map((q) => q.id));
    } catch {
      Alert.alert('Error', 'Reorder failed');
      load();
    } finally {
      setReordering(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>{queueData?.totalInQueue ?? 0} in queue · {TODAY}</Text>
      </View>

      {queueData?.currentlyServing && (
        <View style={styles.serving}>
          <Text style={styles.servingLabel}>NOW SERVING</Text>
          <Text style={styles.servingName}>{queueData.currentlyServing.name}</Text>
          <Text style={styles.servingTime}>{queueData.currentlyServing.timeSlot}</Text>
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={queueData?.queue || []}
        keyExtractor={(q) => q.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.primary} />}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={styles.positionBubble}>
              <Text style={styles.positionText}>{item.position}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.phoneNumber} · {item.timeSlot}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '22' }]}>
                <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.moveButtons}>
              <Pressable style={styles.moveBtn} onPress={() => moveUp(index)} disabled={reordering || index === 0}>
                <Text style={[styles.moveText, index === 0 && styles.moveDimmed]}>↑</Text>
              </Pressable>
              <Pressable
                style={styles.moveBtn}
                onPress={() => moveDown(index)}
                disabled={reordering || index === (queueData?.queue.length ?? 0) - 1}
              >
                <Text style={[styles.moveText, index === (queueData?.queue.length ?? 0) - 1 && styles.moveDimmed]}>↓</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.emptyText}>Queue is empty</Text> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 16, paddingBottom: 8 },
  subtitle: { fontSize: 13, color: Colors.textMuted },
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
  positionBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  positionText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: Colors.text },
  meta: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  statusBadge: { marginTop: 4, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontWeight: '700' },
  moveButtons: { flexDirection: 'column', gap: 4 },
  moveBtn: { width: 30, height: 28, borderRadius: 6, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  moveText: { color: Colors.primary, fontSize: 16, fontWeight: '700' },
  moveDimmed: { color: Colors.border },
  errorText: { color: Colors.error, marginHorizontal: 16, marginBottom: 8, fontSize: 13 },
  emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 },
});
