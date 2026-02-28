import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../../constants';

interface ManageItem {
  title: string;
  subtitle: string;
  icon: string;
  screen: string;
  color: string;
}

const MANAGE_ITEMS: ManageItem[] = [
  { title: 'Services', subtitle: 'Manage services & pricing', icon: 'pricetag-outline', screen: 'ServiceMgmt', color: '#4A90D9' },
  { title: 'Gallery', subtitle: 'Manage work showcase', icon: 'images-outline', screen: 'GalleryMgmt', color: '#7B61FF' },
  { title: 'Reviews', subtitle: 'Moderate customer reviews', icon: 'star-outline', screen: 'ReviewMgmt', color: '#F5A623' },
  { title: 'Business Info', subtitle: 'About & contact details', icon: 'information-circle-outline', screen: 'BusinessInfoMgmt', color: '#50C878' },
  { title: 'Users', subtitle: 'Manage user accounts', icon: 'people-outline', screen: 'UserMgmt', color: '#FF6B6B' },
  { title: 'Calendar', subtitle: 'Working days & schedule', icon: 'calendar-outline', screen: 'CalendarMgmt', color: '#2CCCE4' },
];

export function AdminManageScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Manage Content</Text>
      <View style={styles.grid}>
        {MANAGE_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={styles.card}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={[styles.iconWrap, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon as any} size={28} color={item.color} />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text,
    padding: SPACING.lg, paddingBottom: SPACING.sm,
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: SPACING.md, gap: SPACING.md,
  },
  card: {
    width: '47%', backgroundColor: COLORS.surface,
    borderRadius: 12, padding: SPACING.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  iconWrap: {
    width: 48, height: 48, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm,
  },
  cardTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  cardSubtitle: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
});
