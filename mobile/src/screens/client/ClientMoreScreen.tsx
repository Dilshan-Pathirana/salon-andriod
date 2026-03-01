import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store';
import { COLORS, FONTS, SPACING } from '../../constants';

interface MenuItem {
  title: string;
  subtitle: string;
  icon: string;
  screen: string;
}

const MENU_ITEMS: MenuItem[] = [
  { title: 'About Us', subtitle: 'Our story, mission & hours', icon: 'information-circle-outline', screen: 'About' },
  { title: 'My Appointments', subtitle: 'View your bookings', icon: 'list-outline', screen: 'MyAppointments' },
  { title: 'Live Queue', subtitle: 'See the current queue', icon: 'people-outline', screen: 'LiveQueue' },
  { title: 'Profile', subtitle: 'Account settings & password', icon: 'person-outline', screen: 'ClientProfile' },
];

export function ClientMoreScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();

  return (
    <ScrollView style={styles.container}>
      {/* User card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Text>
        </View>
        <View>
          <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.userPhone}>{user?.phoneNumber}</Text>
        </View>
      </View>

      {/* Menu items */}
      <View style={styles.menuSection}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon as any} size={22} color={COLORS.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={() => logout()}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.lg, backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: 'rgba(200,162,77,0.15)',
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.green, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(200,162,77,0.2)',
  },
  avatarText: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.champagne },
  userName: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  userPhone: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  menuSection: { marginTop: SPACING.md },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: SPACING.md + 2, paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  menuIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.green, justifyContent: 'center', alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(200,162,77,0.2)',
  },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  menuSubtitle: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, padding: SPACING.lg, marginTop: SPACING.xl,
  },
  logoutText: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.danger },
});
