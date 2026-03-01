import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useBookingStore } from '../../store';
import { Button, Loading, ConfirmDialog, EmptyState } from '../../components';
import { COLORS, FONTS, SPACING, STATUS_COLORS } from '../../constants';
import { formatTimeAmPm, getDateRange, getTodayString } from '../../utils';


export function BookAppointmentScreen() {
  const {
    availableDays,
    selectedDate,
    schedule,
    isLoading,
    fetchAvailableDays,
    fetchSchedule,
    bookAppointment,
    setSelectedDate,
  } = useBookingStore();

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [booking, setBooking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    const { startDate, endDate } = getDateRange(30);
    fetchAvailableDays(startDate, endDate);
  }, [fetchAvailableDays]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    loadData();
    if (selectedDate) {
      await fetchSchedule(selectedDate);
    }
    setRefreshing(false);
  };

  // Build marked dates for calendar
  const markedDates: Record<string, { marked: boolean; dotColor: string; selectedColor?: string; selected?: boolean }> = {};
  availableDays.forEach((day) => {
    markedDates[day.date] = {
      marked: true,
      dotColor: day.availableSlots > 0 ? COLORS.statusAvailable : COLORS.statusClosed,
    };
  });

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: COLORS.primary,
      marked: markedDates[selectedDate]?.marked ?? false,
      dotColor: markedDates[selectedDate]?.dotColor ?? COLORS.primary,
    };
  }

  const handleDayPress = (day: DateData) => {
    setSelectedSlot(null);
    const isAvailable = availableDays.some((d) => d.date === day.dateString);
    if (!isAvailable) {
      Alert.alert('Unavailable', 'This date is not available for booking.');
      return;
    }
    setSelectedDate(day.dateString);
    fetchSchedule(day.dateString);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) return;

    setBooking(true);
    try {
      const appointment = await bookAppointment(selectedDate, selectedSlot);
      setShowConfirm(false);
      setSelectedSlot(null);
      Alert.alert(
        'Booking Confirmed!',
        `Your appointment is booked.\nDate: ${selectedDate}\nTime: ${formatTimeAmPm(selectedSlot)}\nQueue Position: ${appointment.queuePosition}`,
      );
    } catch (error) {
      let message = 'Booking failed. Please try again.';
      if (error instanceof Error) {
        message = error.message;
      }
      Alert.alert('Booking Failed', message);
    } finally {
      setBooking(false);
      setShowConfirm(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.sectionTitle}>Select Date</Text>
      <View style={styles.calendarContainer}>
        <Calendar
          minDate={getTodayString()}
          markedDates={markedDates}
          onDayPress={handleDayPress}
          theme={{
            calendarBackground: COLORS.surface,
            dayTextColor: COLORS.text,
            monthTextColor: COLORS.champagne,
            textSectionTitleColor: COLORS.textSecondary,
            textDisabledColor: 'rgba(245,245,245,0.2)',
            todayTextColor: COLORS.champagne,
            selectedDayBackgroundColor: COLORS.champagne,
            selectedDayTextColor: '#0F0F0F',
            arrowColor: COLORS.champagne,
            dotColor: COLORS.statusAvailable,
          }}
        />
      </View>

      {selectedDate && (
        <View style={styles.slotsSection}>
          <Text style={styles.sectionTitle}>
            Available Slots — {selectedDate}
          </Text>

          {isLoading ? (
            <Loading fullScreen={false} message="Loading slots..." />
          ) : schedule?.slots ? (
            <View style={styles.slotsGrid}>
              {schedule.slots.map((slot) => (
                <TouchableOpacity
                  key={slot.time}
                  style={[
                    styles.slotButton,
                    slot.available ? styles.slotAvailable : styles.slotBooked,
                    selectedSlot === slot.time && styles.slotSelected,
                  ]}
                  disabled={!slot.available}
                  onPress={() => setSelectedSlot(slot.time)}
                >
                  <Text
                    style={[
                      styles.slotText,
                      slot.available ? styles.slotTextAvailable : styles.slotTextBooked,
                      selectedSlot === slot.time && styles.slotTextSelected,
                    ]}
                  >
                    {formatTimeAmPm(slot.time)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="calendar-outline"
              title="No Schedule"
              message="No schedule found for this date"
            />
          )}

          {selectedSlot && (
            <Button
              title={`Book ${formatTimeAmPm(selectedSlot)}`}
              onPress={() => setShowConfirm(true)}
              size="lg"
              style={styles.bookButton}
            />
          )}
        </View>
      )}

      <ConfirmDialog
        visible={showConfirm}
        title="Confirm Booking"
        message={`Book appointment on ${selectedDate} at ${selectedSlot ? formatTimeAmPm(selectedSlot) : ''}?`}
        confirmText="Book Now"
        onConfirm={handleBooking}
        onCancel={() => setShowConfirm(false)}
        loading={booking}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.statusAvailable }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.textLight }]} />
          <Text style={styles.legendText}>Booked</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  calendarContainer: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(200,162,77,0.2)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  slotsSection: {
    marginTop: SPACING.md,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  slotButton: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md + 2,
    borderRadius: 9999,
    borderWidth: 1,
    minWidth: 90,
    alignItems: 'center',
  },
  slotAvailable: {
    backgroundColor: COLORS.statusAvailable + '15',
    borderColor: COLORS.statusAvailable,
  },
  slotBooked: {
    backgroundColor: COLORS.surfaceSecondary,
    borderColor: COLORS.border,
  },
  slotSelected: {
    backgroundColor: COLORS.champagne,
    borderColor: COLORS.champagne,
  },
  slotText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  slotTextAvailable: {
    color: COLORS.statusAvailable,
  },
  slotTextBooked: {
    color: COLORS.textLight,
  },
  slotTextSelected: {
    color: '#0F0F0F',
  },
  bookButton: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
});
