import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { galleryApi } from '../../services';
import { Loading, EmptyState } from '../../components';
import { COLORS, FONTS, SPACING } from '../../constants';
import { GalleryItem } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / 2;

const GALLERY_CATEGORIES = ['All', 'Haircut', 'Beard', 'Fade', 'Styling'];

export function GalleryScreen() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const loadItems = useCallback(async () => {
    try {
      const data = await galleryApi.getAll();
      setItems(data);
      filterByCategory(data, selectedCategory);
    } catch {
      // handled
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filterByCategory = (data: GalleryItem[], category: string) => {
    if (category === 'All') {
      setFilteredItems(data);
    } else {
      setFilteredItems(data.filter((i) => i.category === category));
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    filterByCategory(items, category);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: GalleryItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setSelectedImage(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
      <View style={styles.cardOverlay}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardCategory}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) return <Loading message="Loading gallery..." />;

  return (
    <View style={styles.container}>
      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={GALLERY_CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item && styles.categoryChipActive,
              ]}
              onPress={() => handleCategorySelect(item)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === item && styles.categoryChipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={
          filteredItems.length === 0 ? styles.emptyContainer : styles.listContent
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            icon="images-outline"
            title="No Photos"
            message="No gallery items in this category"
          />
        }
      />

      {/* Image Modal */}
      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedImage(null)}>
            <Ionicons name="close-circle" size={32} color={COLORS.textWhite} />
          </TouchableOpacity>
          {selectedImage && (
            <View style={styles.modalContent}>
              <Image
                source={{ uri: selectedImage.imageUrl }}
                style={styles.modalImage}
                resizeMode="contain"
              />
              <Text style={styles.modalTitle}>{selectedImage.title}</Text>
              {selectedImage.description && (
                <Text style={styles.modalDescription}>{selectedImage.description}</Text>
              )}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  categoryContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryList: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 9999,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(200,162,77,0.3)',
  },
  categoryChipActive: {
    backgroundColor: COLORS.champagne,
    borderColor: COLORS.champagne,
  },
  categoryChipText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.champagne,
    letterSpacing: 0.5,
  },
  categoryChipTextActive: {
    color: '#0F0F0F',
  },
  listContent: {
    padding: SPACING.lg,
  },
  emptyContainer: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(200,162,77,0.2)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  image: {
    width: '100%',
    height: CARD_WIDTH,
  },
  cardOverlay: {
    padding: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  cardCategory: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  modalContent: {
    width: SCREEN_WIDTH - 40,
    alignItems: 'center',
  },
  modalImage: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_WIDTH - 40,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.textWhite,
    marginTop: SPACING.lg,
  },
  modalDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});
