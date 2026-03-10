import { getServices } from '../lib/api';
import { Service } from '../lib/types';
import { Colors } from '../constants/Colors';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const CATEGORIES = ['ALL', 'HAIRCUT', 'BEARD', 'COMBO', 'PREMIUM'] as const;

function ServiceCard({ service }: { service: Service }) {
  const router = useRouter();
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.name}>{service.name}</Text>
        <Text style={styles.price}>Rs. {service.price}</Text>
      </View>
      <Text style={styles.desc}>{service.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.duration}>⏱ {service.durationMins} min</Text>
        <Pressable style={styles.bookBtn} onPress={() => router.push('/(tabs)/book')}>
          <Text style={styles.bookBtnText}>Book</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ServicesScreen() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  useEffect(() => {
    getServices()
      .then((s) => setServices(s.filter((x) => x.isActive)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'ALL'
    ? services
    : services.filter((s) => (s as any).category === activeCategory || s.name.toUpperCase().includes(activeCategory));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Our Services</Text>
      </View>

      {/* Category filter */}
      <FlatList
        horizontal
        data={CATEGORIES as any as string[]}
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.filterChip, item === activeCategory && styles.filterChipActive]}
            onPress={() => setActiveCategory(item)}
          >
            <Text style={[styles.filterChipText, item === activeCategory && styles.filterChipTextActive]}>
              {item}
            </Text>
          </Pressable>
        )}
      />

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => <ServiceCard service={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No services found</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 16, paddingTop: 12 },
  backBtn: { marginBottom: 8 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text },
  filterRow: { paddingHorizontal: 12, paddingVertical: 8 },
  filterChip: {
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { color: Colors.textMuted, fontWeight: '600', fontSize: 13 },
  filterChipTextActive: { color: '#fff' },
  list: { padding: 16 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  name: { fontSize: 16, fontWeight: '700', color: Colors.text, flex: 1, marginRight: 8 },
  price: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  desc: { fontSize: 13, color: Colors.textMuted, marginBottom: 10, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  duration: { fontSize: 13, color: Colors.textMuted },
  bookBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14 },
  bookBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 },
});
