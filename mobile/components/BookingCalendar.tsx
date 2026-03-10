import { Colors } from '../constants/Colors';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type Props = {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  scheduleDays?: Array<{ date: string; status: string }>;
};

// Compute today's date string in IST (UTC+5:30) regardless of device timezone
function getTodayISTKey(): string {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const d = new Date(Date.now() + IST_OFFSET_MS);
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, '0'),
    String(d.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

export default function BookingCalendar({ selectedDate, onSelectDate, minDate, maxDate, scheduleDays }: Props) {
  const todayKey = getTodayISTKey();

  const min = minDate || todayKey;
  const max = maxDate || (() => {
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const d = new Date(Date.now() + IST_OFFSET_MS);
    d.setUTCDate(d.getUTCDate() + 5);
    return [
      d.getUTCFullYear(),
      String(d.getUTCMonth() + 1).padStart(2, '0'),
      String(d.getUTCDate()).padStart(2, '0'),
    ].join('-');
  })();

  // Internal view state — navigation changes only the displayed month,
  // NOT the selected date, so the user can browse without losing their pick.
  const initBase = selectedDate
    ? new Date(selectedDate + 'T00:00:00')
    : new Date(todayKey + 'T00:00:00');
  const [viewYear, setViewYear] = useState(initBase.getFullYear());
  const [viewMonth, setViewMonth] = useState(initBase.getMonth());

  const year = viewYear;
  const month = viewMonth;

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function goMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  const monthLabel = `${MONTHS[month]} ${year}`;

  return (
    <View style={styles.wrapper}>
      {/* Month navigation */}
      <View style={styles.header}>
        <Pressable style={styles.navBtn} onPress={() => goMonth(-1)}>
          <Text style={styles.navArrow}>‹</Text>
        </Pressable>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <Pressable style={styles.navBtn} onPress={() => goMonth(1)}>
          <Text style={styles.navArrow}>›</Text>
        </Pressable>
      </View>

      {/* Day-of-week headers */}
      <View style={styles.weekRow}>
        {DAYS.map((d) => (
          <Text key={d} style={styles.dayHeader}>{d}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {cells.map((day, idx) => {
          if (!day) {
            return <View key={`empty-${idx}`} style={styles.cell} />;
          }

          const dateStr = `${String(year)}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayKey;
          const isPast = dateStr < min;
          const isFuture = dateStr > max;
          const isInRange = !isPast && !isFuture;
          const scheduleEntry = scheduleDays?.find((s) => s.date === dateStr);
          const dayStatus = scheduleEntry?.status;
          const isOpen = dayStatus === 'OPEN' && isInRange;
          const isClosed = dayStatus === 'CLOSED' && isInRange;
          const isUninitiated = isInRange && !isOpen && !isClosed;
          const disabled = !isInRange || isClosed;

          return (
            <Pressable
              key={dateStr}
              style={[
                styles.cell,
                !isSelected && isUninitiated && !isToday && styles.cellUninitiated,
                !isSelected && isToday && !isClosed && styles.cellToday,
                !isSelected && isOpen && styles.cellOpen,
                !isSelected && isClosed && styles.cellClosed,
                !isInRange && styles.cellOutOfRange,
                isSelected && styles.cellSelected,
              ]}
              onPress={() => !disabled && onSelectDate(dateStr)}
              disabled={disabled}
            >
              <Text
                style={[
                  styles.dayText,
                  !isSelected && isToday && !isClosed && !isOpen && styles.dayTextToday,
                  !isSelected && isOpen && styles.dayTextOpen,
                  !isSelected && isClosed && styles.dayTextClosed,
                  !isInRange && styles.dayTextOutOfRange,
                  isSelected && styles.dayTextSelected,
                ]}
              >
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, styles.legendOpen]} />
          <Text style={styles.legendLabel}>Open</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, styles.legendClosed]} />
          <Text style={styles.legendLabel}>Closed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, styles.legendUninit]} />
          <Text style={styles.legendLabel}>Not set</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, styles.legendSelected]} />
          <Text style={styles.legendLabel}>Selected</Text>
        </View>
      </View>
    </View>
  );
}

const CELL_SIZE = 40;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
  },
  navArrow: {
    fontSize: 22,
    color: Colors.primary,
    fontWeight: '600',
    lineHeight: 26,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    paddingVertical: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: CELL_SIZE / 2,
  },
  cellSelected: { backgroundColor: Colors.primary },
  cellToday: { backgroundColor: Colors.primaryLight },
  cellOpen: { backgroundColor: '#DCFCE7' },
  cellClosed: { backgroundColor: '#FEE2E2' },
  cellUninitiated: { backgroundColor: '#F1F5F9' },
  cellOutOfRange: { opacity: 0.25 },
  dayText: { fontSize: 13, fontWeight: '500', color: Colors.text },
  dayTextSelected: { color: '#fff', fontWeight: '700' },
  dayTextToday: { color: Colors.primary, fontWeight: '700' },
  dayTextOpen: { color: '#15803D', fontWeight: '600' },
  dayTextClosed: { color: '#DC2626', fontWeight: '600' },
  dayTextOutOfRange: { color: Colors.textMuted },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendSwatch: { width: 11, height: 11, borderRadius: 3 },
  legendOpen: { backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#86EFAC' },
  legendClosed: { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5' },
  legendUninit: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: Colors.border },
  legendSelected: { backgroundColor: Colors.primary },
  legendLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },
});
