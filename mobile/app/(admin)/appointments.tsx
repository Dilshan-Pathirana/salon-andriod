import { adminCompleteAppointment, adminDeleteAppointment, adminGetAppointments, ManagedAppointment } from '../../lib/api';
import { Colors } from '../../constants/Colors';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const TODAY = new Date().toISOString().split('T')[0];

function statusColor(status: ManagedAppointment['status']): string {
  switch (status) {
    case 'BOOKED': return '#F59E0B';
    case 'IN_SERVICE': return Colors.primary;
    case 'COMPLETED': return '#10B981';
    case 'CANCELLED': return '#EF4444';
    default: return Colors.textMuted;
  }
}

export default function AdminAppointmentsScreen() {
  const [appointments, setAppointments] = useState<ManagedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterDate, setFilterDate] = useState(TODAY);
  const [error, setError] = useState('');

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const data = await adminGetAppointments({ date: filterDate });
      setAppointments(data);
    } catch {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, [filterDate]);

  async function handleComplete(id: string) {
    try {
      await adminCompleteAppointment(id);
      setAppointments((p) => p.map((a) => a.id === id ? { ...a, status: 'COMPLETED' as const } : a));
    } catch {
      Alert.alert('Error', 'Could not mark as complete');
    }
  }

  async function handleDelete(id: string, name: string) {
    Alert.alert('Delete', `Delete appointment for ${name}?`, [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminDeleteAppointment(id);
            setAppointments((p) => p.filter((a) => a.id !== id));
          } catch {
            Alert.alert('Error', 'Delete failed');
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Date filter */}
      <View style={styles.filterRow}>
        <TextInput
          style={styles.filterInput}
          value={filterDate}
          onChangeText={setFilterDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={Colors.textMuted}
          color={Colors.text}
        />
        <Pressable style={styles.todayChip} onPress={() => setFilterDate(TODAY)}>
          <Text style={styles.todayChipText}>Today</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={appointments}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.primary} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View>
                <Text style={styles.name}>{item.userName}</Text>
                <Text style={styles.meta}>{item.phoneNumber}</Text>
                <Text style={styles.meta}>{item.timeSlot}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '22' }]}>
                <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.actionRow}>
              {item.status === 'BOOKED' || item.status === 'IN_SERVICE' ? (
                <Pressable style={styles.completeBtn} onPress={() => handleComplete(item.id)}>
                  <Text style={styles.completeBtnText}>Complete</Text>
                </Pressable>
              ) : null}
              <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item.id, item.userName)}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.emptyText}>No appointments for this date</Text> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  filterRow: { flexDirection: 'row', padding: 12, gap: 8, alignItems: 'center' },
  filterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: Colors.card,
  },
  todayChip: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  todayChipText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  list: { padding: 12 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.text },
  meta: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  statusText: { fontSize: 12, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 8 },
  completeBtn: { flex: 1, backgroundColor: '#10B981', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  completeBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  deleteBtn: { flex: 1, borderWidth: 1, borderColor: Colors.error, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  deleteBtnText: { color: Colors.error, fontWeight: '700', fontSize: 13 },
  errorText: { color: Colors.error, marginHorizontal: 16, marginBottom: 8, fontSize: 13 },
  emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 },
});
