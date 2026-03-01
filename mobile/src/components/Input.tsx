import React, { forwardRef, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextInput,
  TextInputProps,
  Pressable,
  Animated,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, containerStyle, leftIcon, isPassword, onFocus, onBlur, style, ...props },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);

  // Track focus with a ref — NO re-render on focus/blur
  const focusedRef = useRef(false);
  // Use Animated for border color so we skip React re-renders entirely
  const focusAnim = useRef(new Animated.Value(0)).current;

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? COLORS.danger : 'rgba(93,68,41,0.25)', COLORS.champagne],
  });

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    focusedRef.current = true;
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    focusedRef.current = false;
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View
        style={[
          styles.inputContainer,
          { borderColor },
          error ? styles.error : undefined,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={COLORS.textLight}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={COLORS.textLight}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword && !showPassword}
          autoCorrect={false}
          {...props}
        />
        {isPassword && (
          <Pressable
            onPress={() => setShowPassword((v) => !v)}
            style={styles.eyeIcon}
            hitSlop={8}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textLight}
            />
          </Pressable>
        )}
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '500',
    color: COLORS.champagne,
    marginBottom: SPACING.xs + 2,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(93,68,41,0.25)',
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    minHeight: 52,
  },
  error: {
    borderColor: COLORS.danger,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  leftIcon: {
    marginRight: SPACING.sm,
  },
  eyeIcon: {
    padding: SPACING.xs,
  },
  errorText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.danger,
    marginTop: SPACING.xs,
  },
});
