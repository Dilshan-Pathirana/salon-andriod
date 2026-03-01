import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = true,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const buttonStyle: ViewStyle[] = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style ?? {},
  ];

  const labelStyle: TextStyle[] = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    isDisabled && styles.textDisabled,
    textStyle ?? {},
  ];

  const iconColor =
    variant === 'outline' || variant === 'ghost'
      ? COLORS.primary
      : variant === 'primary'
      ? '#0C100E'
      : COLORS.textWhite;

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.65}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : variant === 'primary' ? '#0C100E' : COLORS.textWhite}
        />
      ) : (
        <View style={styles.content}>
          {icon && (
            <Ionicons
              name={icon}
              size={size === 'sm' ? 15 : size === 'lg' ? 20 : 17}
              color={iconColor}
              style={styles.icon}
            />
          )}
          <Text style={labelStyle} numberOfLines={1}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 6,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },

  // Variants
  variant_primary: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  variant_secondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(93,68,41,0.25)',
  },
  variant_danger: {
    backgroundColor: COLORS.danger,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.champagne,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },

  // Sizes
  size_sm: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: 10,
  },
  size_md: {
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.xl,
    borderRadius: 14,
  },
  size_lg: {
    paddingVertical: SPACING.lg + 2,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 16,
  },

  // Text
  text: {
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  text_primary: {
    color: '#0C100E',
  },
  text_secondary: {
    color: COLORS.textWhite,
  },
  text_danger: {
    color: COLORS.textWhite,
  },
  text_outline: {
    color: COLORS.champagne,
  },
  text_ghost: {
    color: COLORS.champagne,
  },
  textDisabled: {
    opacity: 0.7,
  },

  textSize_sm: {
    fontSize: FONTS.sizes.sm,
  },
  textSize_md: {
    fontSize: FONTS.sizes.md,
  },
  textSize_lg: {
    fontSize: FONTS.sizes.lg,
  },
});
