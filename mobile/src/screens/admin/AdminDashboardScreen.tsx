import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { sessionService } from '../../services';
import { Button, Loading, ConfirmDialog } from '../../components';
import { COLORS, FONTS, SPACING } from '../../constants';
import { getTodayString } from '../../utils';
import { Session, DashboardStats } from '../../types';
import { AxiosError } from 'axios';

export function AdminDashboardScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionType, setActionType] = useState<'open' | 'close'>('open');
  const [actioning, setActioning] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [sessionRes, statsRes] = await Promise.all([
        sessionService.getSession(getTodayString()).catch(() => null),
        sessionService.getDashboardStats(getTodayString()).catch(() => null),
      ]);
      setSession(sessionRes as Session | null);
      setStats(statsRes as DashboardStats | null);
    } catch {
      // handled
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSessionAction = async () => {
    setActioning(true);
    try {
      if (actionType === 'open') {
        const res = await sessionService.openSession(getTodayString());
        setSession(res as Session);
        Alert.alert('Success', 'Session opened');
      } else {
        const res = await sessionService.closeSession(getTodayString());
        setSession(res as Session);
        Alert.alert('Success', 'Session closed');
      }
      await loadData();
    } catch (error) {
      let message = 'Action failed';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      Alert.alert('Error', message);
    } finally {
      setActioning(false);
      setShowConfirm(false);
    }
  };

  if (isLoading) {
    return <Loading message="Loading dashboard..." />;
  }

  const isOpen = session?.status === 'OPEN';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Session Status */}
      <View style={[styles.sessionCard, isOpen ? styles.sessionOpen : styles.sessionClosed]}>
        <View style={styles.sessionHeader}>
          <Ionicons
            name={isOpen ? 'radio' : 'radio-outline'}
            size={24}
            color={isOpen ? COLORS.statusAvailable : COLORS.statusClosed}
          />
          <Text style={styles.sessionTitle}>Today's Session</Text>
        </View>
        <Text style={[styles.sessionStatus, isOpen ? styles.statusOpen : styles.statusClosed]}>
          {isOpen ? 'OPEN' : session ? 'CLOSED' : 'NOT STARTED'}
        </Text>
        <Button
          title={isOpen ? 'Close Session' : 'Open Session'}
          variant={isOpen ? 'danger' : 'primary'}
          onPress={() => {
            setActionType(isOpen ? 'close' : 'open');
            setShowConfirm(true);
          }}
          style={styles.sessionButton}
        />
      </View>

      {/* Stats Grid */}
      <Text style={styles.sectionTitle}>Today's Statistics</Text>
      <View style={styles.statsGrid}>
        <StatCard
          icon="calendar"
          label="Total"
          value={stats?.totalAppointments ?? 0}
          color={COLORS.primary}
        />
        <StatCard
          icon="people"
          label="In Queue"
          value={stats?.inQueue ?? 0}
          color={COLORS.statusBooked}
        />
        <StatCard
          icon="flash"
          label="In Service"
          value={stats?.inService ?? 0}
          color={COLORS.statusInService}
        />
        <StatCard
          icon="checkmark-circle"
          label="Completed"
          value={stats?.completed ?? 0}
          color={COLORS.statusCompleted}
        />
        <StatCard
          icon="close-circle"
          label="No Show"
          value={stats?.noShow ?? 0}
          color={COLORS.statusNoShow}
        />
        <StatCard
          icon="ban"
          label="Cancelled"
          value={stats?.cancelled ?? 0}
          color={COLORS.statusCancelled}
        />
      </View>

      <ConfirmDialog
        visible={showConfirm}
        title={actionType === 'open' ? 'Open Session' : 'Close Session'}
        message={
          actionType === 'open'
            ? 'Open today\'s session? Clients will be able to see the live queue.'
            : 'Close today\'s session? Make sure all appointments are completed.'
        }
        confirmText={actionType === 'open' ? 'Open' : 'Close'}
        variant={actionType === 'close' ? 'danger' : 'default'}
        onConfirm={handleSessionAction}
        onCancel={() => setShowConfirm(false)}
        loading={actioning}
      />
    </ScrollView>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  sessionCard: {
    margin: SPACING.lg,
    padding: SPACING.xl,
    borderRadius: 16,
    borderWidth: 1,
  },
  sessionOpen: {
    backgroundColor: COLORS.statusAvailable + '10',
    borderColor: COLORS.statusAvailable + '30',
  },
  sessionClosed: {
    backgroundColor: COLORS.surfaceSecondary,
    borderColor: COLORS.border,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sessionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  sessionStatus: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
    marginVertical: SPACING.md,
  },
  statusOpen: {
    color: COLORS.statusAvailable,
  },
  statusClosed: {
    color: COLORS.statusClosed,
  },
  sessionButton: {
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    paddingBottom: SPACING.xl,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '31%',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(93,68,41,0.2)',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  statValue: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '300',
    color: COLORS.champagne,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
