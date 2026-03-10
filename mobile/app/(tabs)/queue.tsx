import { getLiveQueue, LiveQueueItem, LiveQueueResponse } from '../../lib/api';
import { Colors } from '../../constants/Colors';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

function statusColor(status: LiveQueueItem['status']): string {
  switch (status) {
    case 'IN_SERVICE': return Colors.primary;
    case 'BOOKED': return '#F59E0B';
    case 'COMPLETED': return '#10B981';
    case 'CANCELLED': return '#EF4444';
    default: return Colors.textMuted;
  }
}

function statusLabel(status: LiveQueueItem['status']): string {
  switch (status) {
    case 'IN_SERVICE': return 'In Service';
    case 'BOOKED': return 'Waiting';
    case 'COMPLETED': return 'Done';
    case 'CANCELLED': return 'Cancelled';
    case 'NO_SHOW': return 'No Show';
    default: return status;
  }
}

function QueueCard({ item }: { item: LiveQueueItem }) {
  return (
    <View style={styles.card}>
      <View style={styles.positionBadge}>
        <Text style={styles.positionText}>{item.position}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>{item.timeSlot}</Text>
        {item.estimatedWaitMins > 0 && (
          <Text style={styles.wait}>~{item.estimatedWaitMins}m wait</Text>
        )}
      </View>
      <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '22' }]}>
        <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
          {statusLabel(item.status)}
        </Text>
      </View>
    </View>
  );
}

export default function QueueScreen() {
  const [queue, setQueue] = useState<LiveQueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function fetch(isRefresh = false) {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const data = await getLiveQueue();
      setQueue(data);
    } catch (e: any) {
      setError('Could not load queue. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetch(); }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Queue</Text>
        {queue && (
          <Text style={styles.subtitle}>{queue.date} · {queue.totalInQueue} in queue</Text>
        )}
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => fetch()}>
            <Text style={styles.retryLink}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {queue?.currentlyServing && (
        <View style={styles.currentlyServing}>
          <Text style={styles.csLabel}>Currently Serving</Text>
          <Text style={styles.csName}>{queue.currentlyServing.name}</Text>
          <Text style={styles.csMeta}>{queue.currentlyServing.timeSlot}</Text>
        </View>
      )}

      <FlatList
        data={queue?.queue.filter((q) => q.status === 'BOOKED') || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <QueueCard item={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} tintColor={Colors.primary} />}
        ListEmptyComponent={
          !error ? <Text style={styles.emptyText}>No one waiting right now</Text> : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, paddingTop: 12 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  listContent: { padding: 16 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  positionBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  positionText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.text },
  meta: { fontSize: 13, color: Colors.textMuted },
  wait: { fontSize: 12, color: Colors.primary, marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  currentlyServing: {
    margin: 16,
    marginTop: 0,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 18,
  },
  csLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  csName: { color: '#fff', fontSize: 20, fontWeight: '800' },
  csMeta: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  errorBox: { margin: 16, alignItems: 'center' },
  errorText: { color: Colors.error, fontSize: 13, marginBottom: 8 },
  retryLink: { color: Colors.primary, fontWeight: '600' },
  emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 },
});
