import { useAuth } from '../../context/AuthContext';
import BookingCalendar from '../../components/BookingCalendar';
import { createAppointment, getClientScheduleByDate, getScheduleDays, getServices, getTodayIST, getMaxDateIST } from '../../lib/api';
import { Service } from '../../lib/types';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const TODAY = getTodayIST();
const MAX_DATE = getMaxDateIST(5);
type Step = 'date' | 'time' | 'service' | 'success';

export default function BookScreen() {
  const { session } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState<string>(TODAY);
  const [slots, setSlots] = useState<Array<{ time: string; available: boolean }>>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [noSchedule, setNoSchedule] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [scheduleDays, setScheduleDays] = useState<Array<{ date: string; status: string }>>([]);

  // Auth guard
  useEffect(() => {
    if (!session) router.replace('/(auth)/login');
  }, [session]);

  // Load schedule status for the booking window
  useEffect(() => {
    if (!session) return;
    getScheduleDays(TODAY, MAX_DATE).then(setScheduleDays).catch(() => {});
  }, [session]);

  // Load slots when date advances to time step
  useEffect(() => {
    if (step === 'time') {
      setSlots([]);
      setNoSchedule(false);
      setSlotsLoading(true);
      setError('');
      getClientScheduleByDate(selectedDate)
        .then((res) => {
          if (!res || res.status !== 'OPEN') {
            setNoSchedule(true);
            setSlots([]);
          } else {
            setSlots(res.slots || []);
          }
        })
        .catch(() => { setNoSchedule(true); setSlots([]); })
        .finally(() => setSlotsLoading(false));
    }
  }, [step, selectedDate]);

  // Load services when advancing to service step
  useEffect(() => {
    if (step === 'service' && services.length === 0) {
      setServicesLoading(true);
      getServices()
        .then((s) => setServices(s.filter((x) => x.isActive)))
        .catch(() => {})
        .finally(() => setServicesLoading(false));
    }
  }, [step]);

  async function handleConfirm() {
    setError('');
    setBooking(true);
    try {
      await createAppointment({ date: selectedDate, timeSlot: selectedSlot });
      setStep('success');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  }

  if (!session) return null;

  /*  Success screen  */
  if (step === 'success') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successScreen}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={52} color="#fff" />
          </View>
          <Text style={styles.successTitle}>Your Time Has Been Secured</Text>
          <Text style={styles.successSub}>We look forward to welcoming you.</Text>
          <Text style={styles.successDetails}>{selectedDate} at {selectedSlot}</Text>
          <Pressable style={styles.successBtn} onPress={() => router.push('/(tabs)/appointments')}>
            <Text style={styles.successBtnText}>View My Appointments</Text>
          </Pressable>
          <Pressable
            style={[styles.successBtn, styles.successBtnOutline]}
            onPress={() => { setStep('date'); setSelectedSlot(''); setSelectedService(''); setError(''); }}
          >
            <Text style={[styles.successBtnText, { color: Colors.primary }]}>Book Another</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  /*  Step headers  */
  const stepLabels: Record<Step, string> = {
    date: 'Pick a Date',
    time: 'Choose a Time',
    service: 'Select a Service',
    success: 'Confirmed',
  };
  const stepOrder: Step[] = ['date', 'time', 'service'];
  const stepIndex = stepOrder.indexOf(step);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        {stepOrder.map((s, i) => (
          <View key={s} style={[styles.progressStep, i <= stepIndex && styles.progressStepActive]} />
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={styles.stepLabel}>{stepLabels[step]}</Text>

        {/*  Step 1: Date  */}
        {step === 'date' && (
          <>
            <BookingCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              maxDate={MAX_DATE}
              scheduleDays={scheduleDays}
            />
            <Pressable
              style={[styles.nextBtn, !selectedDate && styles.nextBtnDisabled]}
              onPress={() => setStep('time')}
              disabled={!selectedDate}
            >
              <Text style={styles.nextBtnText}>Continue </Text>
            </Pressable>
          </>
        )}

        {/*  Step 2: Time  */}
        {step === 'time' && (
          <>
            <Text style={styles.subLabel}>Date: {selectedDate}</Text>
            {slotsLoading ? (
              <ActivityIndicator color={Colors.primary} style={{ marginTop: 24 }} />
            ) : noSchedule ? (
              <View style={styles.emptyBox}>
                <Ionicons name="calendar-outline" size={36} color={Colors.textMuted} />
                <Text style={styles.emptyText}>No schedule available for this date.</Text>
                <Pressable onPress={() => setStep('date')}>
                  <Text style={styles.linkText}>Pick another date</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.slotGrid}>
                {slots.map((slot) => (
                  <Pressable
                    key={slot.time}
                    style={[
                      styles.slotBtn,
                      !slot.available && styles.slotBtnUnavailable,
                      selectedSlot === slot.time && styles.slotBtnSelected,
                    ]}
                    onPress={() => slot.available && setSelectedSlot(slot.time)}
                    disabled={!slot.available}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        !slot.available && styles.slotTextUnavailable,
                        selectedSlot === slot.time && styles.slotTextSelected,
                      ]}
                    >
                      {slot.time}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {!noSchedule && (
              <View style={styles.navRow}>
                <Pressable style={styles.backBtn} onPress={() => setStep('date')}>
                  <Text style={styles.backBtnText}> Back</Text>
                </Pressable>
                <Pressable
                  style={[styles.nextBtn, !selectedSlot && styles.nextBtnDisabled]}
                  onPress={() => setStep('service')}
                  disabled={!selectedSlot}
                >
                  <Text style={styles.nextBtnText}>Continue </Text>
                </Pressable>
              </View>
            )}
          </>
        )}

        {/*  Step 3: Service  */}
        {step === 'service' && (
          <>
            <Text style={styles.subLabel}>{selectedDate} at {selectedSlot}</Text>
            {servicesLoading ? (
              <ActivityIndicator color={Colors.primary} style={{ marginTop: 24 }} />
            ) : (
              services.map((s) => (
                <Pressable
                  key={s.id}
                  style={[styles.serviceCard, selectedService === s.id && styles.serviceCardSelected]}
                  onPress={() => setSelectedService(s.id)}
                >
                  <View style={styles.serviceRow}>
                    <Text style={styles.serviceName}>{s.name}</Text>
                    <Text style={styles.servicePrice}>Rs. {s.price}</Text>
                  </View>
                  <Text style={styles.serviceDesc} numberOfLines={2}>{s.description}</Text>
                  <Text style={styles.serviceDuration}>{s.durationMins} min</Text>
                  {selectedService === s.id && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} style={styles.serviceCheck} />
                  )}
                </Pressable>
              ))
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.navRow}>
              <Pressable style={styles.backBtn} onPress={() => setStep('time')}>
                <Text style={styles.backBtnText}> Back</Text>
              </Pressable>
              <Pressable
                style={[styles.nextBtn, (!selectedService || booking) && styles.nextBtnDisabled]}
                onPress={handleConfirm}
                disabled={!selectedService || booking}
              >
                {booking ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.nextBtnText}>Confirm Booking</Text>
                )}
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  progressBar: { flexDirection: 'row', gap: 4, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  progressStep: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  progressStepActive: { backgroundColor: Colors.primary },
  stepLabel: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 20 },
  subLabel: { fontSize: 14, color: Colors.textMuted, marginBottom: 16 },

  // Slots
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  slotBtn: { minWidth: 80, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.card, alignItems: 'center' },
  slotBtnSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  slotBtnUnavailable: { backgroundColor: Colors.border, opacity: 0.5 },
  slotText: { fontSize: 14, fontWeight: '600', color: Colors.text },
  slotTextSelected: { color: '#fff' },
  slotTextUnavailable: { color: Colors.textMuted },

  // Service cards
  serviceCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: Colors.border, position: 'relative' },
  serviceCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  serviceName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  servicePrice: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  serviceDesc: { fontSize: 13, color: Colors.textMuted, marginBottom: 4 },
  serviceDuration: { fontSize: 12, color: Colors.textMuted },
  serviceCheck: { position: 'absolute', top: 14, right: 14 },

  // Navigation
  navRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  backBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  backBtnText: { color: Colors.text, fontWeight: '600', fontSize: 15 },
  nextBtn: { flex: 2, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
  linkText: { color: Colors.primary, fontWeight: '600', fontSize: 14, marginTop: 4 },
  errorText: { color: Colors.danger, fontSize: 13, marginBottom: 10, textAlign: 'center' },

  // Success screen
  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  successTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  successSub: { fontSize: 15, color: Colors.textMuted, textAlign: 'center' },
  successDetails: { fontSize: 16, fontWeight: '600', color: Colors.primary },
  successBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 28, alignItems: 'center', width: '100%' },
  successBtnOutline: { backgroundColor: Colors.primaryLight, borderWidth: 1.5, borderColor: Colors.primary },
  successBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
