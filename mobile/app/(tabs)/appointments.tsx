import { cancelMyAppointment, getMyAppointments } from '../../lib/api';
import { Appointment } from '../../lib/types';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const TODAY = new Date().toISOString().split('T')[0];

function statusColor(s: Appointment['status']): string {
  switch (s) {
    case 'BOOKED': return Colors.warning;
    case 'COMPLETED': return Colors.success;
    case 'CANCELLED': return Colors.danger;
    default: return Colors.textMuted;
  }
}

function AppointmentCard({
  item,
  onCancel,
}: {
  item: Appointment;
  onCancel: (id: string) => void;
}) {
  const canCancel = item.status === 'BOOKED' || (item.status as string) === 'IN_SERVICE';
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.dateBlock}>
          <Text style={styles.dateText}>{item.date}</Text>
          <Text style={styles.timeText}>{item.timeSlot}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '22' }]}>
          <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>
      {item.queuePosition > 0 && (
        <Text style={styles.queuePos}>Queue position: #{item.queuePosition}</Text>
      )}
      {canCancel && (
        <Pressable
          style={styles.cancelBtn}
          onPress={() =>
            Alert.alert('Cancel Appointment', 'Are you sure you want to cancel?', [
              { text: 'No' },
              { text: 'Yes, Cancel', style: 'destructive', onPress: () => onCancel(item.id) },
            ])
          }
        >
          <Text style={styles.cancelBtnText}>Cancel Appointment</Text>
        </Pressable>
      )}
    </View>
  );
}

function Section({
  title,
  items,
  onCancel,
  accent,
}: {
  title: string;
  items: Appointment[];
  onCancel: (id: string) => void;
  accent?: string;
}) {
  if (items.length === 0) return null;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {accent && <View style={[styles.sectionDot, { backgroundColor: accent }]} />}
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{items.length}</Text>
      </View>
      {items.map((a) => (
        <AppointmentCard key={a.id} item={a} onCancel={onCancel} />
      ))}
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
      setAppointments(await getMyAppointments());
    } catch {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCancel(id: string) {
    try {
      await cancelMyAppointment(id);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'CANCELLED' } : a)),
      );
    } catch {
      Alert.alert('Error', 'Could not cancel. Please try again.');
    }
  }

  const today = appointments.filter((a) => a.date === TODAY);
  const upcoming = appointments.filter(
    (a) => a.date > TODAY && (a.status === 'BOOKED' || (a.status as string) === 'IN_SERVICE'),
  );
  const past = appointments.filter(
    (a) => a.date < TODAY || a.status === 'COMPLETED' || a.status === 'CANCELLED' || a.status === 'NO_SHOW',
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Appointments</Text>
      </View>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {loading && !refreshing ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="time-outline" size={52} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Appointments Yet</Text>
            <Text style={styles.emptyText}>Book an appointment to get started.</Text>
          </View>
        ) : (
          <>
            <Section title="Today" items={today} onCancel={handleCancel} accent={Colors.primary} />
            <Section title="Upcoming" items={upcoming} onCancel={handleCancel} accent={Colors.warning} />
            <Section title="Past" items={past} onCancel={handleCancel} />
          </>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  loadingText: { textAlign: 'center', marginTop: 40, color: Colors.textMuted },
  errorBox: { margin: 16, padding: 14, backgroundColor: '#FEE2E2', borderRadius: 10 },
  errorText: { color: Colors.danger, textAlign: 'center' },
  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 14, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
  section: { paddingTop: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10, gap: 8 },
  sectionDot: { width: 10, height: 10, borderRadius: 5 },
  sectionTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.text },
  sectionCount: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateBlock: {},
  dateText: { fontSize: 15, fontWeight: '700', color: Colors.text },
  timeText: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  queuePos: { fontSize: 12, color: Colors.textMuted, marginTop: 8 },
  cancelBtn: { marginTop: 12, backgroundColor: '#FEF2F2', borderRadius: 8, paddingVertical: 9, alignItems: 'center', borderWidth: 1, borderColor: Colors.danger },
  cancelBtnText: { color: Colors.danger, fontWeight: '700', fontSize: 13 },
});
