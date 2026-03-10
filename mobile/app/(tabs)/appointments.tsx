import { cancelMyAppointment, getMyAppointments } from '../../lib/api';
import { Appointment } from '../../lib/types';
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

function statusColor(status: Appointment['status']): string {
  switch (status) {
    case 'BOOKED': return '#F59E0B';
    case 'COMPLETED': return '#10B981';
    case 'CANCELLED': return '#EF4444';
    case 'NO_SHOW': return Colors.textMuted;
    default: return Colors.textMuted;
  }
}

function AppointmentCard({ item, onCancel }: { item: Appointment; onCancel: (id: string) => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.date}>{item.date}</Text>
          <Text style={styles.time}>{item.timeSlot}</Text>
          {item.queuePosition > 0 && (
            <Text style={styles.queue}>Queue #{item.queuePosition}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '22' }]}>
          <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>
      {item.status === 'BOOKED' && (
        <Pressable
          style={styles.cancelBtn}
          onPress={() =>
            Alert.alert('Cancel Appointment', 'Are you sure you want to cancel?', [
              { text: 'No' },
              { text: 'Yes, Cancel', style: 'destructive', onPress: () => onCancel(item.id) },
            ])
          }
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </Pressable>
      )}
    </View>
  );
}

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const data = await getMyAppointments();
      setAppointments(data);
    } catch {
      setError('Failed to load appointments. Make sure you are signed in.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleCancel(id: string) {
    try {
      await cancelMyAppointment(id);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'CANCELLED' as const } : a))
      );
    } catch {
      Alert.alert('Error', 'Could not cancel appointment. Please try again.');
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>My Appointments</Text>
      </View>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => load()}>
            <Text style={styles.retryLink}>Retry</Text>
          </Pressable>
        </View>
      ) : null}
      <FlatList
        data={appointments}
        keyExtractor={(a) => a.id}
        renderItem={({ item }) => <AppointmentCard item={item} onCancel={handleCancel} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.primary} />}
        ListEmptyComponent={
          !loading && !error ? <Text style={styles.emptyText}>No appointments found</Text> : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, paddingTop: 12 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text },
  listContent: { padding: 16 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  info: { flex: 1 },
  date: { fontSize: 15, fontWeight: '700', color: Colors.text },
  time: { fontSize: 14, color: Colors.textMuted, marginTop: 2 },
  queue: { fontSize: 13, color: Colors.primary, marginTop: 4 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  cancelBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelBtnText: { color: Colors.error, fontWeight: '600', fontSize: 13 },
  errorBox: { margin: 16, alignItems: 'center' },
  errorText: { color: Colors.error, fontSize: 13, marginBottom: 8 },
  retryLink: { color: Colors.primary, fontWeight: '600' },
  emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 },
});
