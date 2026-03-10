import { useAuth } from '../../context/AuthContext';
import { getLiveQueue, LiveQueueItem, LiveQueueResponse } from '../../lib/api';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const TODAY = new Date().toISOString().split('T')[0];

function statusColor(s: LiveQueueItem['status']) {
  switch (s) {
    case 'IN_SERVICE': return Colors.primary;
    case 'BOOKED': return Colors.warning;
    case 'COMPLETED': return Colors.success;
    case 'CANCELLED': return Colors.danger;
    default: return Colors.textMuted;
  }
}

export default function QueueScreen() {
  const { session } = useAuth();
  const [queue, setQueue] = useState<LiveQueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      setQueue(await getLiveQueue(TODAY));
    } catch {
      setError('Could not load queue. Pull to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const myItem = session
    ? queue?.queue.find((q) => q.userId === session.user.id)
    : null;

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Live Queue</Text>
          <View style={styles.liveBadge}>
            <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : !queue || queue.queue.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-outline" size={52} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Appointments Today</Text>
            <Text style={styles.emptyText}>The queue is empty. Check back later.</Text>
          </View>
        ) : (
          <>
            {/* Queue count circle */}
            <View style={styles.countSection}>
              <View style={styles.countCircle}>
                <Text style={styles.countNumber}>{queue.totalInQueue}</Text>
                <Text style={styles.countLabel}>in queue</Text>
              </View>
            </View>

            {/* Now Serving */}
            {queue.currentlyServing && (
              <View style={styles.nowServingCard}>
                <Text style={styles.nowServingLabel}>Now Serving</Text>
                <Text style={styles.nowServingName}>{queue.currentlyServing.name}</Text>
                <View style={styles.nowServingUnderline} />
                <Text style={styles.nowServingTime}>{queue.currentlyServing.timeSlot}</Text>
              </View>
            )}

            {/* Your position */}
            {myItem && (
              <View style={styles.myPositionCard}>
                <Ionicons name="person-circle-outline" size={24} color={Colors.primary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.myPositionLabel}>Your Position</Text>
                  <Text style={styles.myPositionNumber}>#{myItem.position}</Text>
                </View>
                {myItem.estimatedWaitMins > 0 && (
                  <View style={styles.waitBadge}>
                    <Text style={styles.waitText}>~{myItem.estimatedWaitMins}m wait</Text>
                  </View>
                )}
              </View>
            )}

            {/* Queue list */}
            <View style={styles.queueList}>
              <Text style={styles.listTitle}>Full Queue</Text>
              {queue.queue
                .filter((q) => q.status !== 'COMPLETED' && q.status !== 'CANCELLED')
                .map((item) => {
                  const isMe = session?.user.id === item.userId;
                  const isServing = item.status === 'IN_SERVICE';
                  return (
                    <View key={item.id} style={[styles.queueItem, isMe && styles.queueItemMe, isServing && styles.queueItemServing]}>
                      <View style={[styles.positionBadge, { backgroundColor: isServing ? Colors.primary : Colors.primaryLight }]}>
                        <Text style={[styles.positionText, { color: isServing ? '#fff' : Colors.primary }]}>
                          {item.position}
                        </Text>
                      </View>
                      <View style={styles.queueInfo}>
                        <Text style={styles.queueName}>
                          {isMe ? 'You' : item.name}
                          {isMe && <Text style={styles.youTag}> (you)</Text>}
                        </Text>
                        <Text style={styles.queueTime}>{item.timeSlot}</Text>
                      </View>
                      <View>
                        {isServing ? (
                          <View style={styles.inChairBadge}>
                            <Text style={styles.inChairText}>In Chair</Text>
                          </View>
                        ) : (
                          <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '20' }]}>
                            <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
                              {item.status === 'BOOKED' ? 'Waiting' : item.status}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
            </View>
          </>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success, marginRight: 6 },
  liveText: { fontSize: 11, fontWeight: '700', color: '#065F46' },
  errorBox: { margin: 16, padding: 14, backgroundColor: '#FEE2E2', borderRadius: 10 },
  errorText: { color: Colors.danger, textAlign: 'center', fontSize: 14 },
  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 14, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
  countSection: { alignItems: 'center', paddingVertical: 20 },
  countCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  countNumber: { fontSize: 44, fontWeight: '800', color: '#fff', lineHeight: 48 },
  countLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  nowServingCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: Colors.card, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  nowServingLabel: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  nowServingName: { fontSize: 24, fontWeight: '800', color: Colors.text },
  nowServingUnderline: { width: 48, height: 3, backgroundColor: Colors.primary, borderRadius: 2, marginTop: 6, marginBottom: 8 },
  nowServingTime: { fontSize: 13, color: Colors.textMuted },
  myPositionCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 16, backgroundColor: Colors.primaryLight, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.primary },
  myPositionLabel: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  myPositionNumber: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  waitBadge: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  waitText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  queueList: { marginHorizontal: 16 },
  listTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  queueItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  queueItemMe: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  queueItemServing: { borderColor: Colors.primary },
  positionBadge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  positionText: { fontSize: 15, fontWeight: '800' },
  queueInfo: { flex: 1, marginLeft: 12 },
  queueName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  youTag: { fontSize: 12, fontWeight: '400', color: Colors.primary },
  queueTime: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  inChairBadge: { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  inChairText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
});
