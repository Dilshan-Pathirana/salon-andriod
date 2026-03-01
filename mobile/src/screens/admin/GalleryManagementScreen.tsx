import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { galleryApi } from '../../services';
import { Loading, EmptyState, Button, ConfirmDialog } from '../../components';
import { COLORS, FONTS, SPACING } from '../../constants';
import { GalleryItem } from '../../types';
import { AxiosError } from 'axios';

const GALLERY_CATEGORIES = ['Haircut', 'Beard', 'Fade', 'Styling'];

export function GalleryManagementScreen() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Haircut');
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      const data = await galleryApi.getAll(true);
      setItems(data);
    } catch {
      // handled
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const openAddForm = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setImageUrl('');
    setCategory('Haircut');
    setShowForm(true);
  };

  const openEditForm = (item: GalleryItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description || '');
    setImageUrl(item.imageUrl);
    setCategory(item.category);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !imageUrl.trim()) {
      Alert.alert('Validation', 'Title and image URL are required');
      return;
    }
    setSaving(true);
    try {
      if (editingItem) {
        await galleryApi.update(editingItem.id, {
          title: title.trim(),
          description: description.trim() || null,
          imageUrl: imageUrl.trim(),
          category,
        });
        Alert.alert('Success', 'Gallery item updated');
      } else {
        await galleryApi.create({
          title: title.trim(),
          description: description.trim() || undefined,
          imageUrl: imageUrl.trim(),
          category,
        });
        Alert.alert('Success', 'Gallery item added');
      }
      setShowForm(false);
      await loadItems();
    } catch (error) {
      let message = 'Failed to save';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await galleryApi.delete(deleteTarget);
      await loadItems();
      Alert.alert('Success', 'Gallery item deleted');
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

  const renderItem = ({ item }: { item: GalleryItem }) => (
    <View style={[styles.card, !item.isActive && styles.cardInactive]}>
      <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} resizeMode="cover" />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardCategory}>{item.category}</Text>
        {item.description && (
          <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
        )}
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openEditForm(item)}>
          <Ionicons name="create-outline" size={18} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setDeleteTarget(item.id)}>
          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) return <Loading message="Loading gallery..." />;

  return (
    <View style={styles.container}>
      <Button title="+ Add Image" onPress={openAddForm} style={styles.addButton} />

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          items.length === 0 ? styles.emptyContainer : styles.listContent
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState icon="images-outline" title="No Gallery Items" message="Add your first image" />
        }
      />

      {/* Add/Edit Modal */}
      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Image' : 'Add Image'}
            </Text>

            <Text style={styles.label}>Title *</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Image title" placeholderTextColor={COLORS.textLight} />

            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Description" placeholderTextColor={COLORS.textLight} multiline numberOfLines={2} />

            <Text style={styles.label}>Image URL *</Text>
            <TextInput style={styles.input} value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." placeholderTextColor={COLORS.textLight} autoCapitalize="none" />

            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.preview} resizeMode="cover" />
            ) : null}

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryRow}>
              {GALLERY_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, category === cat && styles.catChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={styles.modalBtn} />
              <Button title="Save" onPress={handleSave} loading={saving} style={styles.modalBtn} />
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Image"
        message="Are you sure you want to delete this gallery item?"
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
  addButton: { margin: SPACING.lg, marginBottom: 0 },
  listContent: { padding: SPACING.lg, gap: SPACING.md },
  emptyContainer: { flex: 1 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.md,
    borderWidth: 1, borderColor: 'rgba(200,162,77,0.2)',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  cardInactive: { opacity: 0.6 },
  thumbnail: { width: 60, height: 60, borderRadius: 8, marginRight: SPACING.md },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  cardCategory: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  cardDesc: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginTop: 2 },
  cardActions: { gap: SPACING.sm },
  actionBtn: { padding: SPACING.xs },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: SPACING.xl, maxHeight: '85%', borderTopWidth: 1, borderTopColor: 'rgba(200,162,77,0.2)' },
  modalTitle: { fontSize: FONTS.sizes.xl, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.lg, letterSpacing: 0.5 },
  label: { fontSize: FONTS.sizes.xs, fontWeight: '500', color: COLORS.champagne, marginBottom: SPACING.xs, marginTop: SPACING.sm, textTransform: 'uppercase', letterSpacing: 1.5 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: FONTS.sizes.md, color: COLORS.text, backgroundColor: COLORS.background },
  textArea: { minHeight: 60, textAlignVertical: 'top' },
  preview: { width: '100%', height: 150, borderRadius: 8, marginTop: SPACING.sm },
  categoryRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  catChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: 9999, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(200,162,77,0.3)' },
  catChipActive: { backgroundColor: COLORS.champagne, borderColor: COLORS.champagne },
  catChipText: { fontSize: FONTS.sizes.sm, color: COLORS.champagne, letterSpacing: 0.5 },
  catChipTextActive: { color: '#0F0F0F' },
  modalActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xl },
  modalBtn: { flex: 1 },
});
