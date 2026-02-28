import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { businessInfoApi } from '../../services';
import { Loading, Button } from '../../components';
import { COLORS, FONTS, SPACING } from '../../constants';
import { BusinessInfo } from '../../types';
import { AxiosError } from 'axios';

interface InfoField {
  key: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
  category: 'about' | 'contact';
}

const ABOUT_FIELDS: InfoField[] = [
  { key: 'salon_name', label: 'Salon Name', placeholder: 'Your salon name', category: 'about' },
  { key: 'salon_story', label: 'Our Story', placeholder: 'Tell your story...', multiline: true, category: 'about' },
  { key: 'mission', label: 'Mission', placeholder: 'Your mission statement', multiline: true, category: 'about' },
  { key: 'experience_years', label: 'Years of Experience', placeholder: '5', category: 'about' },
  { key: 'opening_hours', label: 'Opening Hours', placeholder: 'Mon-Sat: 9AM - 6PM', multiline: true, category: 'about' },
];

const CONTACT_FIELDS: InfoField[] = [
  { key: 'phone', label: 'Phone Number', placeholder: '+94712345678', category: 'contact' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: '+94712345678', category: 'contact' },
  { key: 'email', label: 'Email', placeholder: 'info@salon.com', category: 'contact' },
  { key: 'address', label: 'Address', placeholder: 'Your salon address', multiline: true, category: 'contact' },
  { key: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/...', category: 'contact' },
  { key: 'facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/...', category: 'contact' },
  { key: 'google_maps', label: 'Google Maps URL', placeholder: 'https://maps.google.com/...', category: 'contact' },
];

export function BusinessInfoManagementScreen() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const all = await businessInfoApi.getAll();
      const map: Record<string, string> = {};
      all.forEach((item: BusinessInfo) => {
        map[item.key] = item.value;
      });
      setValues(map);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const allFields = [...ABOUT_FIELDS, ...CONTACT_FIELDS];
      const items = allFields
        .filter((f) => values[f.key]?.trim())
        .map((f) => ({
          key: f.key,
          value: values[f.key].trim(),
          category: f.category,
        }));

      await businessInfoApi.bulkUpsert(items);
      Alert.alert('Success', 'Business information updated');
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

  const updateValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const renderField = (field: InfoField) => (
    <View key={field.key} style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{field.label}</Text>
      <TextInput
        style={[styles.input, field.multiline && styles.textArea]}
        value={values[field.key] || ''}
        onChangeText={(text) => updateValue(field.key, text)}
        placeholder={field.placeholder}
        placeholderTextColor={COLORS.textLight}
        multiline={field.multiline}
        numberOfLines={field.multiline ? 3 : 1}
        autoCapitalize={field.key.includes('url') || field.key.includes('http') ? 'none' : 'sentences'}
      />
    </View>
  );

  if (isLoading) return <Loading message="Loading..." />;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Information</Text>
        {ABOUT_FIELDS.map(renderField)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        {CONTACT_FIELDS.map(renderField)}
      </View>

      <Button
        title="Save All Changes"
        onPress={handleSave}
        loading={saving}
        style={styles.saveButton}
        size="lg"
      />

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  section: {
    backgroundColor: COLORS.surface, margin: SPACING.lg, marginBottom: 0,
    padding: SPACING.lg, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md,
  },
  fieldGroup: { marginBottom: SPACING.md },
  fieldLabel: {
    fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.md, color: COLORS.text, backgroundColor: COLORS.background,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  saveButton: { margin: SPACING.lg },
  spacer: { height: SPACING.xxxl },
});
