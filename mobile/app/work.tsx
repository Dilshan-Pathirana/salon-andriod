import { getStories } from '../lib/api';
import { Story } from '../lib/types';
import { Colors } from '../constants/Colors';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

function StoryCard({ story }: { story: Story }) {
  const [showAfter, setShowAfter] = useState(false);
  return (
    <Pressable style={styles.card} onPress={() => setShowAfter((p) => !p)}>
      <Image
        source={{ uri: showAfter ? story.afterImageUrl : story.beforeImageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleBtn, !showAfter && styles.toggleBtnActive]}
          onPress={() => setShowAfter(false)}
        >
          <Text style={[styles.toggleBtnText, !showAfter && styles.toggleBtnTextActive]}>Before</Text>
        </Pressable>
        <Pressable
          style={[styles.toggleBtn, showAfter && styles.toggleBtnActive]}
          onPress={() => setShowAfter(true)}
        >
          <Text style={[styles.toggleBtnText, showAfter && styles.toggleBtnTextActive]}>After</Text>
        </Pressable>
      </View>
      <Text style={styles.caption} numberOfLines={2}>{story.caption}</Text>
    </Pressable>
  );
}

export default function WorkScreen() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStories()
      .then(setStories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Our Work</Text>
        <Text style={styles.subtitle}>Tap a card to toggle before/after</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={stories}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => <StoryCard story={item} />}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No work items yet</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 16, paddingTop: 12 },
  backBtn: { marginBottom: 6 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  list: { padding: 16 },
  columnWrapper: { gap: 12, marginBottom: 12 },
  card: {
    width: CARD_W,
    backgroundColor: Colors.card,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: { width: CARD_W, height: CARD_W, backgroundColor: Colors.border },
  toggleRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.border },
  toggleBtn: { flex: 1, paddingVertical: 6, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: Colors.primary },
  toggleBtnText: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  toggleBtnTextActive: { color: '#fff' },
  caption: { padding: 8, fontSize: 12, color: Colors.text, lineHeight: 16 },
  emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 },
});
