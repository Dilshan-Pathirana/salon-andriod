import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { scheduleService } from '../../services';
import { Button, Loading, ConfirmDialog } from '../../components';
import { COLORS, FONTS, SPACING } from '../../constants';
import { Schedule, ScheduleSummary } from '../../types';


type DayStatus = 'OPEN' | 'CLOSED' | 'HOLIDAY';

export function CalendarManagementScreen() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [allSchedules, setAllSchedules] = useState<ScheduleSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [dayStatus, setDayStatus] = useState<DayStatus>('OPEN');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [slotDuration, setSlotDuration] = useState('30');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const loadSchedules = useCallback(async () => {
    setIsLoading(true);
    try {
      const today = new Date();
      const start = today.toISOString().split('T')[0];
      const end = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const res = await scheduleService.getScheduleRange(start, end);
      setAllSchedules(Array.isArray(res) ? res : []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const loadDay = async (dateString: string) => {
    try {
      const res = await scheduleService.getScheduleByDate(dateString);
      setSchedule(res as Schedule);
      setDayStatus(res?.status || 'OPEN');
      setStartTime(res?.startTime || '09:00');
      setEndTime(res?.endTime || '18:00');
      setSlotDuration(String(res?.slotDurationMins || 30));
    } catch {
      // No schedule for this date - set defaults
      setSchedule(null);
      setDayStatus('OPEN');
      setStartTime('09:00');
      setEndTime('18:00');
      setSlotDuration('30');
    }
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    loadDay(day.dateString);
  };

  const handleSave = async () => {
    if (!selectedDate) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        date: selectedDate,
        dayStatus,
      };

      if (dayStatus === 'OPEN') {
        payload.startTime = startTime;
        payload.endTime = endTime;
        payload.slotDurationMins = parseInt(slotDuration, 10);
      }

      const res = await scheduleService.upsertSchedule(payload);
      setSchedule(res as Schedule);
      Alert.alert('Success', `Schedule updated for ${selectedDate}`);
      loadSchedules(); // refresh calendar markers
    } catch (error) {
      let message = 'Failed to save schedule';
      if (error instanceof Error) {
        message = error.message;
      }
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
      setShowSaveConfirm(false);
    }
  };

  const markedDates: Record<string, object> = {};
  allSchedules.forEach((s) => {
    const color =
      s.status === 'OPEN'
        ? COLORS.statusAvailable
        : s.status === 'HOLIDAY'
        ? COLORS.statusNoShow
        : COLORS.statusClosed;

    markedDates[s.date] = {
      marked: true,
      dotColor: color,
    };
  });

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: COLORS.primary,
    };
  }

  if (isLoading) {
    return <Loading message="Loading schedules..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.calendarContainer}>
        <Calendar
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
          }}
        />
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <LegendItem color={COLORS.statusAvailable} label="Open" />
        <LegendItem color={COLORS.statusClosed} label="Closed" />
        <LegendItem color={COLORS.statusNoShow} label="Holiday" />
      </View>

      {selectedDate ? (
        <View style={styles.form}>
          <Text style={styles.formTitle}>Edit: {selectedDate}</Text>

          {/* Day Status */}
          <Text style={styles.fieldLabel}>Day Status</Text>
          <View style={styles.segmented}>
            {(['OPEN', 'CLOSED', 'HOLIDAY'] as DayStatus[]).map((s) => (
              <Button
                key={s}
                title={s}
                variant={dayStatus === s ? 'primary' : 'outline'}
                size="sm"
                onPress={() => setDayStatus(s)}
                style={styles.segmentBtn}
              />
            ))}
          </View>

          {dayStatus === 'OPEN' && (
            <>
              <Text style={styles.fieldLabel}>Start Time (HH:MM)</Text>
              <TextInput
                style={styles.input}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="09:00"
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.fieldLabel}>End Time (HH:MM)</Text>
              <TextInput
                style={styles.input}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="18:00"
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.fieldLabel}>Slot Duration (minutes)</Text>
              <TextInput
                style={styles.input}
                value={slotDuration}
                onChangeText={setSlotDuration}
                placeholder="30"
                keyboardType="numeric"
                placeholderTextColor={COLORS.textLight}
              />
            </>
          )}

          <Button
            title="Save Schedule"
            onPress={() => setShowSaveConfirm(true)}
            style={styles.saveButton}
            loading={saving}
          />
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Select a date on the calendar to manage its schedule
          </Text>
        </View>
      )}

      <ConfirmDialog
        visible={showSaveConfirm}
        title="Save Schedule"
        message={`Save schedule for ${selectedDate}?\nStatus: ${dayStatus}${dayStatus === 'OPEN' ? `\nHours: ${startTime} - ${endTime}\nSlot: ${slotDuration} min` : ''}`}
        confirmText="Save"
        onConfirm={handleSave}
        onCancel={() => setShowSaveConfirm(false)}
        loading={saving}
      />
    </ScrollView>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  calendarContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(200,162,77,0.2)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    paddingBottom: SPACING.md,
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
  form: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    marginTop: 0,
    padding: SPACING.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(200,162,77,0.2)',
    elevation: 1,
  },
  formTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    letterSpacing: 0.5,
  },
  fieldLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '500',
    color: COLORS.champagne,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  segmented: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  segmentBtn: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  saveButton: {
    marginTop: SPACING.xl,
  },
  placeholder: {
    margin: SPACING.lg,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});
