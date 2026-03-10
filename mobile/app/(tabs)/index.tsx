import { useAuth } from '../../context/AuthContext';
import HamburgerMenu from '../../components/HamburgerMenu';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const TESTIMONIALS = [
  {
    id: '1',
    name: 'James W.',
    text: 'An absolute masterclass in grooming. The attention to detail is unmatched.',
  },
  {
    id: '2',
    name: 'Michael T.',
    text: "The only place I trust. It's more than a haircut, it's a ritual.",
  },
  {
    id: '3',
    name: 'Alexander R.',
    text: 'Refined, quiet, and perfect every single time.',
  },
];

function TestimonialCard({ name, text }: { name: string; text: string }) {
  return (
    <View style={styles.testimonialCard}>
      <View style={styles.quoteRow}>
        <Text style={styles.quoteIcon}>{'"'}</Text>
      </View>
      <Text style={styles.testimonialText}>{text}</Text>
      <Text style={styles.testimonialName}>{' '}{name}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuOpen(true)}>
          <Ionicons name="menu" size={26} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>The Salon</Text>
        {session ? (
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/(tabs)/profile')}>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarSmallText}>
                {session.user.firstName[0]}{session.user.lastName[0]}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.badgeRow}>
            <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={styles.badgeText}>Now Accepting Walk-ins</Text>
          </View>
          <Text style={styles.heroTitle}>Modern grooming{'\n'}redefined.</Text>
          <Text style={styles.heroSub}>
            Premium cuts, expert beard styling, and luxurious grooming  all in one place.
          </Text>
          <Pressable style={styles.heroBtn} onPress={() => router.push('/(tabs)/book')}>
            <Text style={styles.heroBtnText}>Book Appointment</Text>
          </Pressable>
        </View>

        <View style={styles.quickRow}>
          {[
            { label: 'Services', route: '/services', icon: 'cut-outline' as const },
            { label: 'Our Work', route: '/work', icon: 'images-outline' as const },
            { label: 'Queue', route: '/(tabs)/queue', icon: 'list-outline' as const },
          ].map((item) => (
            <Pressable
              key={item.label}
              style={styles.quickCard}
              onPress={() => router.push(item.route as any)}
            >
              <Ionicons name={item.icon} size={22} color={Colors.primary} />
              <Text style={styles.quickLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.dividerWrap}>
          <View style={styles.divider} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Our Clients Say</Text>
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.id} name={t.name} text={t.text} />
          ))}
        </View>

        {session?.user.role === 'ADMIN' && (
          <Pressable style={styles.adminBadge} onPress={() => router.push('/(admin)/dashboard')}>
            <Ionicons name="settings-outline" size={18} color={Colors.primary} />
            <Text style={styles.adminBadgeText}>Admin Dashboard</Text>
          </Pressable>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      <HamburgerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuBtn: { padding: 4, marginRight: 8 },
  topBarTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: Colors.text },
  profileBtn: {},
  avatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  loginBtn: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  loginBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  hero: {
    backgroundColor: '#0F172A',
    padding: 28,
    paddingTop: 40,
    paddingBottom: 44,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59,130,246,0.15)',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginRight: 8,
  },
  badgeText: { color: '#93C5FD', fontSize: 12, fontWeight: '600' },
  heroTitle: { color: '#fff', fontSize: 32, fontWeight: '800', lineHeight: 40, marginBottom: 14 },
  heroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 22, marginBottom: 28 },
  heroBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignSelf: 'flex-start',
  },
  heroBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  quickRow: { flexDirection: 'row', padding: 16, gap: 10 },
  quickCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickLabel: { fontSize: 11, fontWeight: '600', color: Colors.text },
  dividerWrap: { alignItems: 'center', paddingVertical: 8 },
  divider: { width: 64, height: 3, backgroundColor: Colors.primary, borderRadius: 2 },
  section: { padding: 16, paddingTop: 12 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  testimonialCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  quoteRow: { marginBottom: 8 },
  quoteIcon: { fontSize: 28, color: Colors.primary, lineHeight: 30, fontWeight: '800' },
  testimonialText: { fontSize: 14, color: Colors.text, lineHeight: 22, fontStyle: 'italic', marginBottom: 12 },
  testimonialName: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 16,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  adminBadgeText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
});
