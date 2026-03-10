import { adminGetDashboardStats, AdminDashboardStats } from '../../lib/api';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Defs, Line, LinearGradient, Path, Polyline, Stop, Text as SvgText } from 'react-native-svg';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_W = SCREEN_W - 48;
const CHART_H = 120;
const CHART_PAD = 12;

function TrendChart({ data }: { data: Array<{ day: string; count: number }> }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  const points = data.map((d, i) => ({
    x: CHART_PAD + (i / (data.length - 1)) * (CHART_W - CHART_PAD * 2),
    y: CHART_PAD + (1 - d.count / max) * (CHART_H - CHART_PAD * 2),
    count: d.count,
    day: d.day.slice(5),
  }));
  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `M${points[0].x},${CHART_H} ` +
    points.map((p) => `L${p.x},${p.y}`).join(' ') +
    ` L${points[points.length - 1].x},${CHART_H} Z`;

  return (
    <View style={styles.chartBox}>
      <Text style={styles.chartTitle}>User Registration Trend</Text>
      <Svg width={CHART_W} height={CHART_H}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.primary} stopOpacity="0.3" />
            <Stop offset="1" stopColor={Colors.primary} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
          <Line
            key={i}
            x1={CHART_PAD}
            y1={CHART_PAD + v * (CHART_H - CHART_PAD * 2)}
            x2={CHART_W - CHART_PAD}
            y2={CHART_PAD + v * (CHART_H - CHART_PAD * 2)}
            stroke={Colors.border}
            strokeWidth="0.5"
          />
        ))}
        <Path d={area} fill="url(#grad)" />
        <Polyline
          points={polyline}
          fill="none"
          stroke={Colors.primary}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* First / last labels */}
        {[points[0], points[points.length - 1]].map((p, i) => (
          <SvgText key={i} x={p.x} y={CHART_H - 2} fontSize="10" fill={Colors.textMuted} textAnchor="middle">
            {p.day}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const TODAY = new Date().toISOString().split('T')[0];

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <View style={[styles.statCard, color ? { borderLeftColor: color } : {}]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const NAV_ITEMS = [
  { label: 'Services', route: '/(admin)/services', icon: '✂️' },
  { label: 'Session', route: '/(admin)/session', icon: '📋' },
  { label: 'Appointments', route: '/(admin)/appointments', icon: '📅' },
  { label: 'Queue', route: '/(admin)/queue', icon: '📋' },
  { label: 'Our Work', route: '/(admin)/work', icon: '🖼️' },
  { label: 'Users', route: '/(admin)/users', icon: '👥' },
];

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const data = await adminGetDashboardStats(TODAY);
      setStats(data);
    } catch {
      setError('Failed to load dashboard stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#fff" />}
      >
        {loading && !stats ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => load()}><Text style={styles.retryLink}>Retry</Text></Pressable>
          </View>
        ) : stats ? (
          <>
            {/* Session status banner */}
            <View style={[styles.sessionBanner, { backgroundColor: stats.sessionStatus === 'OPEN' ? Colors.primary : '#EF4444' }]}>
              <Text style={styles.sessionLabel}>Session Status</Text>
              <Text style={styles.sessionStatus}>{stats.sessionStatus}</Text>
              <Text style={styles.sessionDate}>{stats.date}</Text>
            </View>

            {/* Stats grid */}
            <View style={styles.statsGrid}>
              <StatCard label="Today's Appointments" value={stats.appointmentsToday} color={Colors.primary} />
              <StatCard label="In Queue" value={stats.inQueue} color="#F59E0B" />
              <StatCard label="Completed" value={stats.completed} color="#10B981" />
              <StatCard label="Cancelled" value={stats.cancelled} color="#EF4444" />
              <StatCard label="Registered Users" value={stats.registeredUsers} color="#8B5CF6" />
              <StatCard label="Active Services" value={stats.activeServices} color="#06B6D4" />
            </View>

            {/* Trend chart */}
            {stats.userRegistrationTrend && stats.userRegistrationTrend.length > 1 && (
              <TrendChart data={stats.userRegistrationTrend} />
            )}
          </>
        ) : null}

        {/* Navigation grid */}
        <Text style={styles.navTitle}>Manage</Text>
        <View style={styles.navGrid}>
          {NAV_ITEMS.map((item) => (
            <Pressable
              key={item.label}
              style={styles.navCard}
              onPress={() => router.push(item.route as any)}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text style={styles.navLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  sessionBanner: { padding: 24, paddingBottom: 20 },
  sessionLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  sessionStatus: { color: '#fff', fontSize: 28, fontWeight: '800', marginVertical: 4 },
  sessionDate: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10 },
  statCard: {
    flex: 1,
    minWidth: '44%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  statValue: { fontSize: 28, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  navTitle: { marginHorizontal: 16, marginTop: 8, marginBottom: 10, fontSize: 16, fontWeight: '700', color: Colors.text },
  navGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, marginBottom: 32 },
  navCard: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navIcon: { fontSize: 26, marginBottom: 8 },
  navLabel: { fontSize: 12, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  errorBox: { alignItems: 'center', margin: 32 },
  errorText: { color: Colors.danger, marginBottom: 8 },
  retryLink: { color: Colors.primary, fontWeight: '600' },
  chartBox: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  chartTitle: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 12 },
});
