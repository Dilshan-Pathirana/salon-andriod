import { useAuth } from '../../context/AuthContext';
import { getServices } from '../../lib/api';
import { Service } from '../../lib/types';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

function ServiceCard({ service }: { service: Service }) {
  const router = useRouter();
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.row}>
        <Text style={cardStyles.name}>{service.name}</Text>
        <Text style={cardStyles.price}>Rs. {service.price}</Text>
      </View>
      <Text style={cardStyles.desc} numberOfLines={2}>{service.description}</Text>
      <Text style={cardStyles.duration}>{service.durationMins} min</Text>
      <Pressable style={cardStyles.bookBtn} onPress={() => router.push('/(tabs)/book')}>
        <Text style={cardStyles.bookBtnText}>Book Now</Text>
      </Pressable>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  name: { fontSize: 16, fontWeight: '700', color: Colors.text, flex: 1, marginRight: 8 },
  price: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  desc: { fontSize: 13, color: Colors.textMuted, marginBottom: 6 },
  duration: { fontSize: 12, color: Colors.textMuted, marginBottom: 10 },
  bookBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  bookBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});

export default function HomeScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices()
      .then(setServices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visibleServices = services.filter((s) => s.isActive).slice(0, 3);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Premium Barber & Spa</Text>
          <Text style={styles.heroTitle}>
            {session ? `Hello, ${session.user.firstName} 👋` : 'Welcome to Our Salon'}
          </Text>
          <Text style={styles.heroSub}>
            Expert grooming. Fresh look. Book your spot today.
          </Text>
          <Pressable style={styles.heroBtn} onPress={() => router.push('/(tabs)/book')}>
            <Text style={styles.heroBtnText}>Book Appointment</Text>
          </Pressable>
        </View>

        {/* Quick links */}
        <View style={styles.quickRow}>
          {[
            { label: 'Services', route: '/services', icon: '✂️' },
            { label: 'Our Work', route: '/work', icon: '🖼️' },
            { label: 'Queue', route: '/(tabs)/queue', icon: '⏳' },
          ].map((item) => (
            <Pressable
              key={item.label}
              style={styles.quickCard}
              onPress={() => router.push(item.route as any)}
            >
              <Text style={styles.quickIcon}>{item.icon}</Text>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Top Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Our Services</Text>
            <Pressable onPress={() => router.push('/services')}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
          ) : (
            visibleServices.map((s) => <ServiceCard key={s.id} service={s} />)
          )}
        </View>

        {/* Admin shortcut */}
        {session?.user.role === 'ADMIN' && (
          <Pressable style={styles.adminBadge} onPress={() => router.push('/(admin)/dashboard')}>
            <Text style={styles.adminBadgeText}>⚙️ Go to Admin Dashboard</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  hero: {
    backgroundColor: Colors.primary,
    padding: 28,
    paddingTop: 44,
    paddingBottom: 36,
  },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 6 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 8 },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 20, marginBottom: 24 },
  heroBtn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 28,
    alignSelf: 'flex-start',
  },
  heroBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  quickRow: { flexDirection: 'row', padding: 16, gap: 10 },
  quickCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickIcon: { fontSize: 22, marginBottom: 6 },
  quickLabel: { fontSize: 12, fontWeight: '600', color: Colors.text },
  section: { padding: 16, paddingTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  seeAll: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  adminBadge: {
    margin: 16,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: 32,
  },
  adminBadgeText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
});
