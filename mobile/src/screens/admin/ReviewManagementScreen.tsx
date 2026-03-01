import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { reviewsApi } from '../../services';
import { Loading, EmptyState, ConfirmDialog } from '../../components';
import { COLORS, FONTS, SPACING } from '../../constants';
import { Review, ReviewStats } from '../../types';
import { AxiosError } from 'axios';

export function ReviewManagementScreen() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [reviewsData, statsData] = await Promise.all([
        reviewsApi.getAll(true),
        reviewsApi.getStats(),
      ]);
      setReviews(reviewsData);
      setStats(statsData);
    } catch {
      // handled
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleVisibility = async (id: string) => {
    try {
      await reviewsApi.toggleVisibility(id);
      await loadData();
    } catch (error) {
      let message = 'Failed to update';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      Alert.alert('Error', message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await reviewsApi.delete(deleteTarget);
      await loadData();
      Alert.alert('Success', 'Review deleted');
    } catch (error) {
      let message = 'Failed to delete';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      Alert.alert('Error', message);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const renderStars = (count: number) => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= count ? 'star' : 'star-outline'}
          size={14}
          color={COLORS.warning}
        />
      ))}
    </View>
  );

  const renderReview = ({ item }: { item: Review }) => (
    <View style={[styles.card, !item.isVisible && styles.cardHidden]}>
      <View style={styles.cardHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.user?.firstName?.[0]}{item.user?.lastName?.[0]}
            </Text>
          </View>
          <View>
            <Text style={styles.reviewerName}>
              {item.user?.firstName} {item.user?.lastName}
            </Text>
            <Text style={styles.reviewDate}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        {renderStars(item.rating)}
      </View>

      {item.comment && (
        <Text style={styles.reviewComment}>{item.comment}</Text>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleToggleVisibility(item.id)}
        >
          <Ionicons
            name={item.isVisible ? 'eye-outline' : 'eye-off-outline'}
            size={18}
            color={item.isVisible ? COLORS.success : COLORS.textLight}
          />
          <Text style={styles.actionText}>
            {item.isVisible ? 'Visible' : 'Hidden'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setDeleteTarget(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
          <Text style={[styles.actionText, { color: COLORS.danger }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) return <Loading message="Loading reviews..." />;

  return (
    <View style={styles.container}>
      {/* Stats */}
      {stats && (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.averageRating}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalReviews}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {reviews.filter((r) => !r.isVisible).length}
            </Text>
            <Text style={styles.statLabel}>Hidden</Text>
          </View>
        </View>
      )}

      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          reviews.length === 0 ? styles.emptyContainer : styles.listContent
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState icon="chatbubble-outline" title="No Reviews" message="No reviews to manage" />
        }
      />

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
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
  container: { flex: 1, backgroundColor: COLORS.background },
  statsBar: {
    flexDirection: 'row', justifyContent: 'space-around',
    padding: SPACING.md, backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: 'rgba(200,162,77,0.15)',
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: FONTS.sizes.xl, fontWeight: '300', color: COLORS.champagne },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase' },
  listContent: { padding: SPACING.lg, gap: SPACING.md },
  emptyContainer: { flex: 1 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.lg,
    borderWidth: 1, borderColor: 'rgba(200,162,77,0.2)',
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2,
  },
  cardHidden: { opacity: 0.5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewerInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.green, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: FONTS.sizes.xs, fontWeight: '600', color: COLORS.champagne },
  reviewerName: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text },
  reviewDate: { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
  starsRow: { flexDirection: 'row', gap: 2 },
  reviewComment: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: SPACING.sm },
  cardActions: {
    flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.lg,
    marginTop: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  actionText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
});
