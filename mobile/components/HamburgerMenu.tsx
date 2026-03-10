import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type MenuItem = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  danger?: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function HamburgerMenu({ visible, onClose }: Props) {
  const { session, logout } = useAuth();
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-320)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    if (visible) {
      setIsHidden(false);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 4 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -320, duration: 220, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(() => setIsHidden(true));
    }
  }, [visible]);

  if (!visible && isHidden) return null;

  function nav(route: string) {
    onClose();
    router.push(route as any);
  }

  const items: MenuItem[] = [
    {
      label: 'Home',
      icon: 'home-outline',
      onPress: () => nav('/(tabs)/'),
    },
    {
      label: 'Services',
      icon: 'cut-outline',
      onPress: () => nav('/services'),
    },
    {
      label: 'Our Work',
      icon: 'images-outline',
      onPress: () => nav('/work'),
    },
  ];

  if (session) {
    items.push(
      {
        label: 'Book Appointment',
        icon: 'calendar-outline',
        onPress: () => nav('/(tabs)/book'),
      },
      {
        label: 'My Appointments',
        icon: 'time-outline',
        onPress: () => nav('/(tabs)/appointments'),
      },
      {
        label: 'Live Queue',
        icon: 'list-outline',
        onPress: () => nav('/(tabs)/queue'),
      },
    );
    if (session.user.role === 'ADMIN') {
      items.push({
        label: 'Admin Dashboard',
        icon: 'settings-outline',
        onPress: () => nav('/(admin)/dashboard'),
      });
    }
    items.push({
      label: 'Sign Out',
      icon: 'log-out-outline',
      danger: true,
      onPress: () => {
        onClose();
        logout();
      },
    });
  } else {
    items.push({
      label: 'Login / Register',
      icon: 'log-in-outline',
      onPress: () => nav('/(auth)/login'),
    });
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Slide panel */}
      <Animated.View style={[styles.panel, { transform: [{ translateX: slideAnim }] }]}>
        {/* Header */}
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.salonName}>The Salon</Text>
            {session && (
              <Text style={styles.greeting}>
                {session.user.firstName} {session.user.lastName}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Menu items */}
        {items.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color={item.danger ? Colors.danger : Colors.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
              {item.label}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 290,
    backgroundColor: Colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 56,
    backgroundColor: Colors.primaryLight,
  },
  salonName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIcon: {
    marginRight: 14,
    width: 22,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  menuLabelDanger: {
    color: Colors.danger,
  },
});
