import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { reviewsApi, appointmentsApi } from '../../services';
import { useAuthStore } from '../../store';
import { Loading, EmptyState, Button } from '../../components';
import { COLORS, FONTS, SPACING } from '../../constants';
import { Review, ReviewStats, Appointment } from '../../types';
import { AxiosError } from 'axios';

export function ReviewsScreen() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Write review state
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [reviewsData, statsData] = await Promise.all([
        reviewsApi.getAll(),
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

  const openWriteReview = async () => {
    try {
      const appointments = await appointmentsApi.getMyAppointments();
      const reviewedIds = new Set(reviews.filter((r) => r.userId === user?.id).map((r) => r.appointmentId));
      const completed = appointments.filter(
        (a) => a.status === 'COMPLETED' && !reviewedIds.has(a.id)
      );
      if (completed.length === 0) {
        Alert.alert('No Eligible Appointments', 'You need a completed appointment without a review to leave one.');
        return;
      }
      setCompletedAppointments(completed);
      setSelectedAppointmentId(completed[0].id);
      setRating(5);
      setComment('');
      setShowWriteReview(true);
    } catch {
      Alert.alert('Error', 'Failed to load your appointments');
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedAppointmentId) return;
    setSubmitting(true);
    try {
      await reviewsApi.create({
        appointmentId: selectedAppointmentId,
        rating,
        comment: comment.trim() || undefined,
      });
      setShowWriteReview(false);
      Alert.alert('Success', 'Your review has been submitted!');
      await loadData();
    } catch (error) {
      let message = 'Failed to submit review';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count: number, size = 16, interactive = false) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity
            key={i}
            disabled={!interactive}
            onPress={() => interactive && setRating(i)}
          >
            <Ionicons
              name={i <= count ? 'star' : 'star-outline'}
              size={size}
              color={COLORS.warning}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>
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
      {item.comment && <Text style={styles.reviewComment}>{item.comment}</Text>}
    </View>
  );

  if (isLoading) return <Loading message="Loading reviews..." />;

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      {stats && (
        <View style={styles.statsCard}>
          <View style={styles.statsMain}>
            <Text style={styles.avgRating}>{stats.averageRating}</Text>
            {renderStars(Math.round(stats.averageRating), 20)}
            <Text style={styles.totalReviews}>{stats.totalReviews} reviews</Text>
          </View>
          <View style={styles.distribution}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.distribution.find((d) => d.rating === star)?.count ?? 0;
              const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              return (
                <View key={star} style={styles.distRow}>
                  <Text style={styles.distStar}>{star}</Text>
                  <Ionicons name="star" size={12} color={COLORS.warning} />
                  <View style={styles.distBarBg}>
                    <View style={[styles.distBarFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.distCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {user?.role === 'CLIENT' && (
        <Button
          title="Write a Review"
          onPress={openWriteReview}
          style={styles.writeButton}
          size="sm"
        />
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
          <EmptyState
            icon="chatbubble-outline"
            title="No Reviews Yet"
            message="Be the first to leave a review!"
          />
        }
      />

      {/* Write Review Modal */}
      <Modal visible={showWriteReview} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Write a Review</Text>

            <Text style={styles.modalLabel}>Select Appointment</Text>
            <FlatList
              data={completedAppointments}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.apptChip,
                    selectedAppointmentId === item.id && styles.apptChipActive,
                  ]}
                  onPress={() => setSelectedAppointmentId(item.id)}
                >
                  <Text style={[
                    styles.apptChipText,
                    selectedAppointmentId === item.id && styles.apptChipTextActive,
                  ]}>
                    {item.date} - {item.timeSlot}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <Text style={styles.modalLabel}>Rating</Text>
            {renderStars(rating, 32, true)}

            <Text style={styles.modalLabel}>Comment (optional)</Text>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Share your experience..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={4}
              maxLength={1000}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setShowWriteReview(false)}
                style={styles.modalActionBtn}
              />
              <Button
                title="Submit"
                onPress={handleSubmitReview}
                loading={submitting}
                style={styles.modalActionBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(93,68,41,0.2)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  statsMain: { alignItems: 'center', marginRight: SPACING.xl },
  avgRating: { fontSize: 36, fontWeight: '300', color: COLORS.champagne },
  totalReviews: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: SPACING.xs },
  distribution: { flex: 1, gap: 4 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distStar: { fontSize: FONTS.sizes.xs, fontWeight: '600', color: COLORS.textSecondary, width: 10 },
  distBarBg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: COLORS.surfaceSecondary },
  distBarFill: { height: 6, borderRadius: 3, backgroundColor: COLORS.warning },
  distCount: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, width: 20, textAlign: 'right' },
  starsRow: { flexDirection: 'row', gap: 2 },
  writeButton: { marginHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  listContent: { padding: SPACING.lg, paddingTop: 0, gap: SPACING.md },
  emptyContainer: { flex: 1 },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(93,68,41,0.2)',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewerInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  avatarSmall: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.green,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarSmallText: { fontSize: FONTS.sizes.xs, fontWeight: '600', color: COLORS.champagne },
  reviewerName: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text },
  reviewDate: { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
  reviewComment: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: SPACING.sm, lineHeight: 20 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: SPACING.xxl,
    maxHeight: '80%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(194,173,144,0.15)',
  },
  modalTitle: { fontSize: FONTS.sizes.xl, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.lg, letterSpacing: 0.5 },
  modalLabel: { fontSize: FONTS.sizes.xs, fontWeight: '500', color: COLORS.champagne, marginTop: SPACING.md, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 1.5 },
  apptChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: 9999, backgroundColor: 'transparent',
    borderWidth: 1, borderColor: 'rgba(194,173,144,0.3)', marginRight: SPACING.sm,
  },
  apptChipActive: { backgroundColor: COLORS.champagne, borderColor: COLORS.champagne },
  apptChipText: { fontSize: FONTS.sizes.sm, color: COLORS.champagne },
  apptChipTextActive: { color: '#0C100E' },
  commentInput: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 14,
    padding: SPACING.md, fontSize: FONTS.sizes.md, color: COLORS.text,
    backgroundColor: COLORS.background, minHeight: 100, textAlignVertical: 'top',
  },
  modalActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xl },
  modalActionBtn: { flex: 1 },
});
