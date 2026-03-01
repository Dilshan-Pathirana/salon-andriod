import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useQueueStore } from '../../store';
import { useSocket } from '../../hooks';
import { Loading, EmptyState, StatusBadge, ConfirmDialog } from '../../components';
import { COLORS, FONTS, SPACING } from '../../constants';
import { formatTimeAmPm, getTodayString } from '../../utils';
import { QueueItem } from '../../types';
import { appointmentsService } from '../../services';


export function QueueManagementScreen() {
  const { liveQueue, isLoading, fetchQueue, reorderQueue } = useQueueStore();
  const { connect, joinQueue } = useSocket();
  const [confirmAction, setConfirmAction] = useState<{
    type: 'inService' | 'complete' | 'noShow';
    item: QueueItem;
  } | null>(null);
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    const init = async () => {
      await connect();
      joinQueue(getTodayString());
      fetchQueue(getTodayString());
    };
    init();
  }, [connect, joinQueue, fetchQueue]);

  const handleDragEnd = async ({ data }: { data: QueueItem[] }) => {
    const orderedIds = data.map((item) => item.id);
    try {
      await reorderQueue(getTodayString(), orderedIds);
    } catch {
      Alert.alert('Error', 'Failed to reorder queue');
      fetchQueue(getTodayString());
    }
  };

  const handleAction = async () => {
    if (!confirmAction) return;
    setActioning(true);
    try {
      const { type, item } = confirmAction;
      if (type === 'inService') {
        await appointmentsService.markInService(item.id);
      } else if (type === 'complete') {
        await appointmentsService.completeAppointment(item.id);
      } else if (type === 'noShow') {
        await appointmentsService.markNoShow(item.id);
      }
      await fetchQueue(getTodayString());
    } catch (error) {
      let message = 'Action failed';
      if (error instanceof Error) {
        message = error.message;
      }
      Alert.alert('Error', message);
    } finally {
      setActioning(false);
      setConfirmAction(null);
    }
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<QueueItem>) => {
    const isInService = item.status === 'IN_SERVICE';

    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.queueCard,
            isActive && styles.queueCardActive,
            isInService && styles.queueCardServing,
          ]}
        >
          <View style={styles.dragHandle}>
            <Ionicons name="reorder-three" size={24} color={COLORS.textLight} />
          </View>

          <View style={styles.positionBadge}>
            <Text style={styles.positionText}>{item.position}</Text>
          </View>

          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemTime}>{formatTimeAmPm(item.timeSlot)}</Text>
          </View>

          <StatusBadge status={item.status} size="sm" />

          <View style={styles.actions}>
            {item.status === 'BOOKED' && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionServe]}
                onPress={() => setConfirmAction({ type: 'inService', item })}
              >
                <Ionicons name="flash" size={18} color={COLORS.statusInService} />
              </TouchableOpacity>
            )}
            {(item.status === 'BOOKED' || item.status === 'IN_SERVICE') && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionComplete]}
                onPress={() => setConfirmAction({ type: 'complete', item })}
              >
                <Ionicons name="checkmark" size={18} color={COLORS.statusCompleted} />
              </TouchableOpacity>
            )}
            {item.status === 'BOOKED' && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionNoShow]}
                onPress={() => setConfirmAction({ type: 'noShow', item })}
              >
                <Ionicons name="close" size={18} color={COLORS.statusNoShow} />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  if (isLoading && !liveQueue) {
    return <Loading message="Loading queue..." />;
  }

  const actionLabels = {
    inService: 'mark in service',
    complete: 'mark as completed',
    noShow: 'mark as no-show',
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{liveQueue?.totalInQueue ?? 0}</Text>
          <Text style={styles.statLabel}>In Queue</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {liveQueue?.currentlyServing ? '1' : '0'}
          </Text>
          <Text style={styles.statLabel}>Serving</Text>
        </View>
      </View>

      {/* Currently Serving */}
      {liveQueue?.currentlyServing && (
        <View style={styles.servingBanner}>
          <Ionicons name="flash" size={16} color={COLORS.statusInService} />
          <Text style={styles.servingText}>
            Serving: {liveQueue.currentlyServing.name} ({formatTimeAmPm(liveQueue.currentlyServing.timeSlot)})
          </Text>
        </View>
      )}

      <Text style={styles.hint}>Long press and drag to reorder queue</Text>

      <DraggableFlatList
        data={liveQueue?.queue ?? []}
        onDragEnd={handleDragEnd}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          (liveQueue?.queue.length ?? 0) === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="Queue Empty"
            message="No appointments in the queue"
          />
        }
      />

      <ConfirmDialog
        visible={!!confirmAction}
        title="Confirm Action"
        message={
          confirmAction
            ? `Are you sure you want to ${actionLabels[confirmAction.type]} for ${confirmAction.item.name}?`
            : ''
        }
        confirmText="Confirm"
        variant={confirmAction?.type === 'noShow' ? 'danger' : 'primary'}
        onConfirm={handleAction}
        onCancel={() => setConfirmAction(null)}
        loading={actioning}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200,162,77,0.15)',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  servingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.statusInService + '15',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  servingText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '500',
    color: COLORS.champagne,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  hint: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingVertical: SPACING.sm,
  },
  listContent: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
  },
  queueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(200,162,77,0.2)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  queueCardActive: {
    elevation: 6,
    shadowOpacity: 0.3,
    transform: [{ scale: 1.02 }],
  },
  queueCardServing: {
    borderWidth: 1.5,
    borderColor: COLORS.statusInService,
  },
  dragHandle: {
    paddingRight: SPACING.sm,
  },
  positionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  positionText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.champagne,
  },
  itemInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  itemName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    flexShrink: 1,
  },
  itemTime: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: SPACING.sm,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  actionServe: {
    backgroundColor: COLORS.statusInService + '15',
    borderColor: COLORS.statusInService + '30',
  },
  actionComplete: {
    backgroundColor: COLORS.statusCompleted + '15',
    borderColor: COLORS.statusCompleted + '30',
  },
  actionNoShow: {
    backgroundColor: COLORS.statusNoShow + '15',
    borderColor: COLORS.statusNoShow + '30',
  },
});
