import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store';
import { COLORS, FONTS, SPACING } from '../constants';

interface DrawerItemProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  onPress: () => void;
}

function DrawerItem({ label, icon, isActive, onPress }: DrawerItemProps) {
  return (
    <TouchableOpacity
      style={[styles.drawerItem, isActive && styles.drawerItemActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.drawerItemIcon, isActive && styles.drawerItemIconActive]}>
        <Ionicons
          name={icon}
          size={20}
          color={isActive ? COLORS.gold : COLORS.textSecondary}
        />
      </View>
      <Text
        style={[styles.drawerItemLabel, isActive && styles.drawerItemLabelActive]}
      >
        {label}
      </Text>
      {isActive && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );
}

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, logout } = useAuthStore();
  const { state, navigation } = props;
  const activeRoute = state.routes[state.index]?.name;

  const menuItems: { name: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { name: 'Landing', label: 'Home', icon: 'home-outline' },
    { name: 'Services', label: 'Services', icon: 'pricetag-outline' },
    { name: 'Book', label: 'Book Appointment', icon: 'calendar-outline' },
    { name: 'Gallery', label: 'Gallery', icon: 'images-outline' },
    { name: 'Reviews', label: 'Reviews', icon: 'star-outline' },
    { name: 'LiveQueue', label: 'Live Queue', icon: 'people-outline' },
    { name: 'MyAppointments', label: 'My Appointments', icon: 'list-outline' },
    { name: 'About', label: 'About Us', icon: 'information-circle-outline' },
    { name: 'Profile', label: 'Profile', icon: 'person-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* Header with user info */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </Text>
          </View>
          <View style={styles.goldRing} />
        </View>
        <Text style={styles.userName}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.userRole}>
          {user?.role === 'ADMIN' ? 'Administrator' : 'Premium Member'}
        </Text>
      </View>

      {/* Separator */}
      <View style={styles.separator} />

      {/* Menu items */}
      <ScrollView
        style={styles.menuScroll}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item) => (
          <DrawerItem
            key={item.name}
            label={item.label}
            icon={item.icon}
            isActive={activeRoute === item.name}
            onPress={() => navigation.navigate(item.name)}
          />
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.separator} />
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => logout()}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200,162,77,0.1)',
  },
  avatarContainer: {
    position: 'relative',
    width: 64,
    height: 64,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.emerald,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  goldRing: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(200,162,77,0.3)',
  },
  avatarText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.gold,
    letterSpacing: 2,
  },
  userName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  userRole: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gold,
    marginTop: 2,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(200,162,77,0.1)',
  },
  menuScroll: {
    flex: 1,
    paddingTop: SPACING.sm,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginHorizontal: SPACING.sm,
    marginVertical: 1,
    borderRadius: 12,
  },
  drawerItemActive: {
    backgroundColor: 'rgba(200,162,77,0.1)',
  },
  drawerItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  drawerItemIconActive: {
    backgroundColor: 'rgba(200,162,77,0.15)',
  },
  drawerItemLabel: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
  },
  drawerItemLabelActive: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  activeIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    backgroundColor: COLORS.gold,
  },
  footer: {
    paddingBottom: 30,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl + SPACING.sm,
    gap: SPACING.md,
  },
  logoutText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.danger,
  },
});
