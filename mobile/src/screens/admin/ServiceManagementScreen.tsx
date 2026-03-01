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
  RefreshControl,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { servicesApi } from '../../services';
import { Loading, EmptyState, Button, ConfirmDialog } from '../../components';
import { COLORS, FONTS, SPACING } from '../../constants';
import { Service, ServiceCategory } from '../../types';
import { AxiosError } from 'axios';

const CATEGORIES: ServiceCategory[] = ['HAIRCUT', 'BEARD', 'COMBO', 'PREMIUM'];

export function ServiceManagementScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('HAIRCUT');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadServices = useCallback(async () => {
    try {
      const data = await servicesApi.getAll(true);
      setServices(data);
    } catch {
      // handled
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  const openAddForm = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setDuration('');
    setPrice('');
    setCategory('HAIRCUT');
    setIsActive(true);
    setShowForm(true);
  };

  const openEditForm = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description || '');
    setDuration(String(service.duration));
    setPrice(String(service.price));
    setCategory(service.category);
    setIsActive(service.isActive);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !duration || !price) {
      Alert.alert('Validation', 'Name, duration, and price are required');
      return;
    }
    setSaving(true);
    try {
      if (editingService) {
        await servicesApi.update(editingService.id, {
          name: name.trim(),
          description: description.trim() || null,
          duration: parseInt(duration),
          price: parseFloat(price),
          category,
          isActive,
        });
        Alert.alert('Success', 'Service updated');
      } else {
        await servicesApi.create({
          name: name.trim(),
          description: description.trim() || undefined,
          duration: parseInt(duration),
          price: parseFloat(price),
          category,
        });
        Alert.alert('Success', 'Service created');
      }
      setShowForm(false);
      await loadServices();
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
      await servicesApi.delete(deleteTarget);
      await loadServices();
      Alert.alert('Success', 'Service deleted');
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

  const renderService = ({ item }: { item: Service }) => (
    <View style={[styles.card, !item.isActive && styles.cardInactive]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            {!item.isActive && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveText}>Inactive</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.cardPrice}>Rs. {item.price}</Text>
      </View>
      {item.description && (
        <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
      )}
      <View style={styles.cardFooter}>
        <Text style={styles.cardDuration}>{item.duration} min</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => openEditForm(item)}
          >
            <Ionicons name="create-outline" size={18} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setDeleteTarget(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (isLoading) return <Loading message="Loading services..." />;

  return (
    <View style={styles.container}>
      <Button
        title="+ Add Service"
        onPress={openAddForm}
        style={styles.addButton}
      />

      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          services.length === 0 ? styles.emptyContainer : styles.listContent
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState icon="pricetag-outline" title="No Services" message="Add your first service" />
        }
      />

      {/* Add/Edit Modal */}
      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingService ? 'Edit Service' : 'Add Service'}
            </Text>

            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Service name"
              placeholderTextColor={COLORS.textLight}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Description"
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={3}
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Duration (min) *</Text>
                <TextInput
                  style={styles.input}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="20"
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>Price (Rs.) *</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="1500"
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            </View>

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, category === cat && styles.catChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {editingService && (
              <View style={styles.switchRow}>
                <Text style={styles.label}>Active</Text>
                <Switch value={isActive} onValueChange={setIsActive} />
              </View>
            )}

            <View style={styles.modalActions}>
              <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={styles.modalBtn} />
              <Button title="Save" onPress={handleSave} loading={saving} style={styles.modalBtn} />
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Service"
        message="Are you sure you want to delete this service?"
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
    backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.lg,
    borderWidth: 1, borderColor: 'rgba(200,162,77,0.2)',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, overflow: 'hidden',
  },
  cardInactive: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardInfo: { flex: 1, marginRight: SPACING.md },
  cardName: { fontSize: FONTS.sizes.md, fontWeight: '500', color: COLORS.text, letterSpacing: 0.3 },
  badgeRow: { flexDirection: 'row', gap: SPACING.xs, marginTop: SPACING.xs },
  categoryBadge: {
    backgroundColor: 'rgba(28,28,28,0.4)', paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: 8,
  },
  categoryText: { fontSize: FONTS.sizes.xs, fontWeight: '500', color: COLORS.champagne, letterSpacing: 0.5, textTransform: 'uppercase' },
  inactiveBadge: {
    backgroundColor: COLORS.danger + '20', paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: 8,
  },
  inactiveText: { fontSize: FONTS.sizes.xs, fontWeight: '600', color: COLORS.danger },
  cardPrice: { fontSize: FONTS.sizes.lg, fontWeight: '400', color: COLORS.gold, letterSpacing: 0.5 },
  cardDescription: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: SPACING.sm },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  cardDuration: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  cardActions: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: { padding: SPACING.xs },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.xxl, maxHeight: '85%', borderTopWidth: 1, borderTopColor: 'rgba(200,162,77,0.15)' },
  modalTitle: { fontSize: FONTS.sizes.xl, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.lg, letterSpacing: 0.5 },
  label: { fontSize: FONTS.sizes.xs, fontWeight: '500', color: COLORS.champagne, marginBottom: SPACING.xs, marginTop: SPACING.sm, textTransform: 'uppercase', letterSpacing: 1.5 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: FONTS.sizes.md, color: COLORS.text, backgroundColor: COLORS.background },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: SPACING.md },
  half: { flex: 1 },
  categoryRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  catChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: 9999, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(200,162,77,0.3)' },
  catChipActive: { backgroundColor: COLORS.champagne, borderColor: COLORS.champagne },
  catChipText: { fontSize: FONTS.sizes.sm, color: COLORS.champagne, letterSpacing: 0.5 },
  catChipTextActive: { color: '#0F0F0F' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.md },
  modalActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xl },
  modalBtn: { flex: 1 },
});
