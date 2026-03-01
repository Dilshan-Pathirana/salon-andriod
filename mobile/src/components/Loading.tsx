import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../constants';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loading({ message, fullScreen = true }: LoadingProps) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <Animated.View style={[styles.iconWrap, { opacity: pulseAnim }]}>
          <Ionicons name="cut" size={40} color={COLORS.primary} />
        </Animated.View>
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <Animated.View style={{ opacity: pulseAnim }}>
        <Ionicons name="cut" size={24} color={COLORS.primary} />
      </Animated.View>
      {message && <Text style={styles.messageInline}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(54,68,66,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(194,173,144,0.15)',
  },
  inline: {
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  message: {
    marginTop: SPACING.lg,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
  },
  messageInline: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
});
