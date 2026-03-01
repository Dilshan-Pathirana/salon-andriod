import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueueStore, useAuthStore } from '../../store';
import { useSocket } from '../../hooks';
import { Loading, EmptyState, StatusBadge } from '../../components';
import { COLORS, FONTS, SPACING } from '../../constants';
import { formatTimeAmPm, formatWaitTime, getTodayString } from '../../utils';
import { QueueItem } from '../../types';

export function LiveQueueScreen() {
  const { liveQueue, isLoading, fetchQueue } = useQueueStore();
  const { user } = useAuthStore();
  const { connect, joinQueue } = useSocket();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const init = async () => {
      await connect();
      joinQueue(getTodayString());
      fetchQueue(getTodayString());
    };
    init();
  }, [connect, joinQueue, fetchQueue]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQueue(getTodayString());
    setRefreshing(false);
  };

  const myPosition = liveQueue?.queue.find((q) => q.userId === user?.id);

  const renderQueueItem = ({ item, index }: { item: QueueItem; index: number }) => {
    const isMe = item.userId === user?.id;

    return (
      <View style={[styles.queueItem, isMe && styles.queueItemHighlight]}>
        <View style={styles.positionBadge}>
          <Text style={styles.positionText}>{item.position}</Text>
        </View>
        <View style={styles.queueItemInfo}>
          <Text style={styles.queueItemName}>
            {isMe ? 'You' : item.name}
          </Text>
          <Text style={styles.queueItemTime}>
            {formatTimeAmPm(item.timeSlot)}
          </Text>
        </View>
        <View style={styles.queueItemRight}>
          <StatusBadge status={item.status} size="sm" />
          {item.status !== 'IN_SERVICE' && (
            <Text style={styles.waitText}>
              ~{formatWaitTime(item.estimatedWaitMins)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (isLoading && !liveQueue) {
    return <Loading message="Loading queue..." />;
  }

  return (
    <View style={styles.container}>
      {/* Currently Serving Card */}
      {liveQueue?.currentlyServing && (
        <View style={styles.servingCard}>
          <View style={styles.servingHeader}>
            <Ionicons name="flash" size={20} color={COLORS.statusInService} />
            <Text style={styles.servingLabel}>CURRENTLY SERVING</Text>
          </View>
          <Text style={styles.servingName}>
            {liveQueue.currentlyServing.name}
          </Text>
          <Text style={styles.servingTime}>
            {formatTimeAmPm(liveQueue.currentlyServing.timeSlot)}
          </Text>
        </View>
      )}

      {/* My Position Card */}
      {myPosition && (
        <View style={styles.myPositionCard}>
          <Text style={styles.myPositionLabel}>Your Position</Text>
          <Text style={styles.myPositionNumber}>#{myPosition.position}</Text>
          <Text style={styles.myPositionWait}>
            Estimated wait: {formatWaitTime(myPosition.estimatedWaitMins)}
          </Text>
        </View>
      )}

      {/* Queue List */}
      <Text style={styles.sectionTitle}>
        Queue ({liveQueue?.totalInQueue ?? 0})
      </Text>

      <FlatList
        data={liveQueue?.queue ?? []}
        renderItem={renderQueueItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          (liveQueue?.queue.length ?? 0) === 0 ? styles.emptyContainer : styles.listContent
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="Queue is Empty"
            message="No one is in the queue right now"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  servingCard: {
    backgroundColor: COLORS.statusInService + '12',
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.statusInService + '25',
    overflow: 'hidden',
  },
  servingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  servingLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '500',
    color: COLORS.champagne,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  servingName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  servingTime: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  myPositionCard: {
    backgroundColor: 'rgba(200,162,77,0.08)',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(200,162,77,0.2)',
    overflow: 'hidden',
  },
  myPositionLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.champagne,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  myPositionNumber: {
    fontSize: 48,
    fontWeight: '300',
    color: COLORS.champagne,
  },
  myPositionWait: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: 0,
    gap: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(200,162,77,0.2)',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  queueItemHighlight: {
    borderWidth: 1.5,
    borderColor: COLORS.champagne,
    backgroundColor: 'rgba(28,28,28,0.3)',
  },
  positionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  positionText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  queueItemInfo: {
    flex: 1,
  },
  queueItemName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    flexShrink: 1,
  },
  queueItemTime: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  queueItemRight: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  waitText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
});
