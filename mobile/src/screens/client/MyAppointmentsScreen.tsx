import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useBookingStore } from '../../store';
import { Button, StatusBadge, EmptyState, Loading, ConfirmDialog } from '../../components';
import { COLORS, FONTS, SPACING } from '../../constants';
import { formatTimeAmPm, formatDate } from '../../utils';
import { Appointment } from '../../types';
import { AxiosError } from 'axios';

export function MyAppointmentsScreen() {
  const { myAppointments, isLoading, fetchMyAppointments, cancelAppointment } = useBookingStore();
  const [refreshing, setRefreshing] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchMyAppointments();
  }, [fetchMyAppointments]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyAppointments();
    setRefreshing(false);
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelAppointment(cancelTarget);
      Alert.alert('Success', 'Appointment cancelled successfully');
    } catch (error) {
      let message = 'Failed to cancel appointment';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      Alert.alert('Error', message);
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  };

  const renderAppointment = ({ item }: { item: Appointment }) => {
    const canCancel = item.status === 'BOOKED';
    const today = new Date().toISOString().split('T')[0];
    const isFuture = item.date >= today;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          <StatusBadge status={item.status} />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>{formatTimeAmPm(item.timeSlot)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Queue Position</Text>
            <Text style={styles.value}>#{item.queuePosition}</Text>
          </View>
          {item.slotDurationMins && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Duration</Text>
              <Text style={styles.value}>{item.slotDurationMins} min</Text>
            </View>
          )}
        </View>

        {canCancel && isFuture && (
          <Button
            title="Cancel Appointment"
            onPress={() => setCancelTarget(item.id)}
            variant="danger"
            size="sm"
            style={styles.cancelButton}
          />
        )}
      </View>
    );
  };

  if (isLoading && myAppointments.length === 0) {
    return <Loading message="Loading appointments..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={myAppointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          myAppointments.length === 0 ? styles.emptyContainer : styles.listContent
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="No Appointments"
            message="You don't have any appointments yet. Book one from the Book tab!"
          />
        }
      />

      <ConfirmDialog
        visible={!!cancelTarget}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Yes, Cancel"
        variant="danger"
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
        loading={cancelling}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dateText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardBody: {
    gap: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  cancelButton: {
    marginTop: SPACING.md,
  },
});
