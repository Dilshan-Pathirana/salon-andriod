import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../components';
import { useAuthStore } from '../../store';
import { COLORS, FONTS, SPACING } from '../../constants';
import { isValidPhone, isValidPassword } from '../../utils';
import { AxiosError } from 'axios';

export function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});

  const { login, isLoading } = useAuthStore();

  const validate = (): boolean => {
    const newErrors: { phone?: string; password?: string } = {};

    if (!phoneNumber) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidPhone(phoneNumber)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword(password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      await login(phoneNumber, password);
    } catch (error) {
      let message = 'Login failed. Please try again.';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      Alert.alert('Login Failed', message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="cut" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Salon App</Text>
          <Text style={styles.subtitle}>Book your appointment</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Phone Number"
            placeholder="Enter 10-digit phone number"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text.replace(/[^0-9]/g, '').slice(0, 10));
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
            }}
            keyboardType="phone-pad"
            maxLength={10}
            leftIcon="call-outline"
            error={errors.phone}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            isPassword
            leftIcon="lock-closed-outline"
            error={errors.password}
          />

          <Button
            title="Login"
            onPress={handleLogin}
            loading={isLoading}
            size="lg"
            style={styles.loginButton}
          />

          <Text style={styles.helpText}>
            Don't have an account? Contact Admin
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  form: {
    width: '100%',
  },
  loginButton: {
    marginTop: SPACING.sm,
  },
  helpText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    marginTop: SPACING.xl,
  },
});
