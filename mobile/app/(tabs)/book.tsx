import { getClientScheduleByDate, getServices, submitBookingRequest } from '../../lib/api';
import { Service } from '../../lib/types';
import { Colors } from '../../constants/Colors';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

const TODAY = new Date().toISOString().split('T')[0];

function getDaysAhead(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

export default function BookScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [slots, setSlots] = useState<Array<{ time: string; available: boolean }>>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const days = getDaysAhead(14);

  useEffect(() => {
    getServices()
      .then((s) => setServices(s.filter((x) => x.isActive)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSelectedSlot('');
    setSlots([]);
    setSlotsLoading(true);
    getClientScheduleByDate(selectedDate)
      .then((res) => setSlots(res?.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate]);

  async function handleBook() {
    setError('');
    if (!form.fullName.trim()) { setError('Full name is required'); return; }
    if (!form.phone.trim()) { setError('Phone number is required'); return; }
    if (!selectedSlot) { setError('Please select a time slot'); return; }
    if (!selectedService) { setError('Please select a service'); return; }

    setLoading(true);
    try {
      const service = services.find((s) => s.id === selectedService);
      await submitBookingRequest({
        fullName: form.fullName.trim(),
        email: form.email.trim() || `${form.phone}@noemail.com`,
        phone: form.phone.trim(),
        serviceName: service?.name || '',
        date: selectedDate,
        time: selectedSlot,
        notes: form.notes.trim() || undefined,
      });
      setSuccess(true);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successBox}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSub}>We'll see you on {selectedDate} at {selectedSlot}</Text>
          <Pressable style={styles.btn} onPress={() => setSuccess(false)}>
            <Text style={styles.btnText}>Book Another</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Book Appointment</Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Date picker */}
          <Text style={styles.label}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayRow}>
            {days.map((d) => {
              const label = new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              const active = d === selectedDate;
              return (
                <Pressable key={d} style={[styles.dayChip, active && styles.dayChipActive]} onPress={() => setSelectedDate(d)}>
                  <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Time slots */}
          <Text style={styles.label}>Select Time</Text>
          {slotsLoading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: 12 }} />
          ) : slots.length === 0 ? (
            <Text style={styles.emptyText}>No slots available for this day</Text>
          ) : (
            <View style={styles.slotsGrid}>
              {slots.map((s) => (
                <Pressable
                  key={s.time}
                  style={[
                    styles.slotChip,
                    !s.available && styles.slotChipBooked,
                    s.time === selectedSlot && styles.slotChipActive,
                  ]}
                  onPress={() => s.available && setSelectedSlot(s.time)}
                  disabled={!s.available}
                >
                  <Text
                    style={[
                      styles.slotChipText,
                      !s.available && styles.slotChipBookedText,
                      s.time === selectedSlot && styles.slotChipActiveText,
                    ]}
                  >
                    {s.time}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Service */}
          <Text style={styles.label}>Select Service</Text>
          {services.map((s) => (
            <Pressable
              key={s.id}
              style={[styles.serviceRow, s.id === selectedService && styles.serviceRowActive]}
              onPress={() => setSelectedService(s.id)}
            >
              <Text style={[styles.serviceName, s.id === selectedService && styles.serviceNameActive]}>{s.name}</Text>
              <Text style={[styles.servicePrice, s.id === selectedService && styles.serviceNameActive]}>Rs. {s.price}</Text>
            </Pressable>
          ))}

          {/* Details form */}
          <Text style={styles.label}>Your Details</Text>
          <TextInput style={styles.input} placeholder="Full name" placeholderTextColor={Colors.textMuted}
            value={form.fullName} onChangeText={(v) => setForm((p) => ({ ...p, fullName: v }))} color={Colors.text} />
          <TextInput style={styles.input} placeholder="Phone number" placeholderTextColor={Colors.textMuted}
            value={form.phone} onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))} keyboardType="phone-pad" color={Colors.text} />
          <TextInput style={styles.input} placeholder="Email (optional)" placeholderTextColor={Colors.textMuted}
            value={form.email} onChangeText={(v) => setForm((p) => ({ ...p, email: v }))} keyboardType="email-address" color={Colors.text} />
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Notes (optional)"
            placeholderTextColor={Colors.textMuted}
            value={form.notes}
            onChangeText={(v) => setForm((p) => ({ ...p, notes: v }))}
            multiline
            color={Colors.text}
          />

          <Pressable style={[styles.btn, loading && styles.btnDisabled]} onPress={handleBook} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Confirm Booking</Text>}
          </Pressable>
          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  header: { padding: 20, paddingTop: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  label: { marginHorizontal: 16, marginBottom: 8, marginTop: 16, fontWeight: '700', color: Colors.text, fontSize: 14 },
  errorText: { color: Colors.error, marginHorizontal: 16, marginBottom: 8, fontSize: 13 },
  dayRow: { paddingHorizontal: 12, marginBottom: 4 },
  dayChip: {
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  dayChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayChipText: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  dayChipTextActive: { color: '#fff' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8, marginBottom: 4 },
  slotChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  slotChipBooked: { backgroundColor: '#f5f5f5', borderColor: '#e0e0e0' },
  slotChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  slotChipText: { fontSize: 13, color: Colors.text, fontWeight: '500' },
  slotChipBookedText: { color: '#bbb', textDecorationLine: 'line-through' },
  slotChipActiveText: { color: '#fff', fontWeight: '700' },
  serviceRow: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceRowActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  serviceName: { fontSize: 14, color: Colors.text, fontWeight: '600' },
  serviceNameActive: { color: Colors.primary },
  servicePrice: { fontSize: 14, color: Colors.textMuted, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  emptyText: { color: Colors.textMuted, marginHorizontal: 16, marginVertical: 8 },
  successBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  successSub: { fontSize: 15, color: Colors.textMuted, marginBottom: 32, textAlign: 'center' },
});
