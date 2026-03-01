import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { appointmentsService } from '../../services';
import { Button, StatusBadge, EmptyState, Loading, ConfirmDialog } from '../../components';
import { COLORS, FONTS, SPACING } from '../../constants';
import { formatTimeAmPm, formatDate, getTodayString } from '../../utils';
import { Appointment, AppointmentStatus } from '../../types';
import { AxiosError } from 'axios';

const STATUS_FILTERS: (AppointmentStatus | 'ALL')[] = [
  'ALL',
  'BOOKED',
  'IN_SERVICE',
  'COMPLETED',
  'NO_SHOW',
  'CANCELLED',
];

export function AppointmentManagementScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState(getTodayString());
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'ALL'>('ALL');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (dateFilter) params.date = dateFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await appointmentsService.getAppointments(params);
      setAppointments(Array.isArray(res) ? res : []);
    } catch {
      // handled
    } finally {
      setIsLoading(false);
    }
  }, [dateFilter, statusFilter]);

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await appointmentsService.deleteAppointment(deleteTarget);
      setAppointments((prev) => prev.filter((a) => a.id !== deleteTarget));
      Alert.alert('Success', 'Appointment deleted');
    } catch (error) {
      let message = 'Failed to delete appointment';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      Alert.alert('Error', message);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleQuickAction = async (id: string, action: 'complete' | 'noShow' | 'cancel') => {
    try {
      if (action === 'complete') {
        await appointmentsService.completeAppointment(id);
      } else if (action === 'noShow') {
        await appointmentsService.markNoShow(id);
      } else if (action === 'cancel') {
        await appointmentsService.cancelAppointment(id);
      }
      fetchData();
    } catch (error) {
      let message = 'Action failed';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      Alert.alert('Error', message);
    }
  };

  const renderItem = ({ item }: { item: Appointment }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.clientName}>
            {item.user?.firstName} {item.user?.lastName}
          </Text>
          <Text style={styles.clientPhone}>{item.user?.phone}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{formatTimeAmPm(item.timeSlot)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="list-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>Queue: #{item.queuePosition}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.cardActions}>
        {item.status === 'BOOKED' && (
          <>
            <TouchableOpacity
              style={[styles.actionChip, { backgroundColor: COLORS.statusCompleted + '15' }]}
              onPress={() => handleQuickAction(item.id, 'complete')}
            >
              <Text style={[styles.actionChipText, { color: COLORS.statusCompleted }]}>Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionChip, { backgroundColor: COLORS.statusNoShow + '15' }]}
              onPress={() => handleQuickAction(item.id, 'noShow')}
            >
              <Text style={[styles.actionChipText, { color: COLORS.statusNoShow }]}>No Show</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionChip, { backgroundColor: COLORS.statusCancelled + '15' }]}
              onPress={() => handleQuickAction(item.id, 'cancel')}
            >
              <Text style={[styles.actionChipText, { color: COLORS.statusCancelled }]}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
        {item.status === 'IN_SERVICE' && (
          <TouchableOpacity
            style={[styles.actionChip, { backgroundColor: COLORS.statusCompleted + '15' }]}
            onPress={() => handleQuickAction(item.id, 'complete')}
          >
            <Text style={[styles.actionChipText, { color: COLORS.statusCompleted }]}>Complete</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionChip, { backgroundColor: COLORS.danger + '15' }]}
          onPress={() => setDeleteTarget(item.id)}
        >
          <Ionicons name="trash-outline" size={14} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Filters */}
      <View style={styles.filterBar}>
        <View style={styles.dateFilterRow}>
          <Ionicons name="calendar" size={18} color={COLORS.primary} />
          <TextInput
            style={styles.dateInput}
            value={dateFilter}
            onChangeText={setDateFilter}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.textLight}
          />
          <TouchableOpacity onPress={() => setDateFilter(getTodayString())}>
            <Text style={styles.todayLink}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDateFilter('')}>
            <Text style={styles.clearLink}>All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          data={STATUS_FILTERS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusFilters}
          renderItem={({ item: s }) => (
            <TouchableOpacity
              style={[styles.filterChip, statusFilter === s && styles.filterChipActive]}
              onPress={() => setStatusFilter(s)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === s && styles.filterChipTextActive,
                ]}
              >
                {s === 'ALL' ? 'All' : s.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isLoading ? (
        <Loading fullScreen={false} message="Loading..." />
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            appointments.length === 0 ? styles.emptyContainer : styles.listContent
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title="No Appointments"
              message="No appointments found with current filters"
            />
          }
        />
      )}

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Appointment"
        message="Are you sure you want to permanently delete this appointment?"
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterBar: {
    backgroundColor: COLORS.surface,
    paddingTop: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(194,173,144,0.15)',
  },
  dateFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
  },
  todayLink: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  clearLink: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
  },
  statusFilters: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.xs,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(194,173,144,0.3)',
  },
  filterChipActive: {
    backgroundColor: COLORS.champagne,
    borderColor: COLORS.champagne,
  },
  filterChipText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '500',
    color: COLORS.champagne,
    letterSpacing: 0.5,
  },
  filterChipTextActive: {
    color: '#0C100E',
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
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(93,68,41,0.2)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  clientName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text,
    flexShrink: 1,
    letterSpacing: 0.3,
  },
  clientPhone: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardBody: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  infoText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  actionChipText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
});
