import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Button, Input } from '../../components';
import { useAuthStore } from '../../store';
import { COLORS, FONTS, SPACING } from '../../constants';
import { isValidPhone, isValidPassword } from '../../utils';
import { AxiosError } from 'axios';

export function LoginScreen() {
  const navigation = useNavigation<any>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});
  const passwordInputRef = useRef<TextInput>(null);

  const { login, isLoading } = useAuthStore();

  const handlePhoneChange = (text: string) => {
    setPhoneNumber(text.replace(/[^0-9]/g, '').slice(0, 10));
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
  };

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
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      style={styles.container}
      showsVerticalScrollIndicator={false}
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
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          maxLength={10}
          leftIcon="call-outline"
          error={errors.phone}
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          blurOnSubmit={false}
        />

        <Input
          ref={passwordInputRef}
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={handlePasswordChange}
          isPassword
          leftIcon="lock-closed-outline"
          error={errors.password}
          returnKeyType="go"
          onSubmitEditing={handleLogin}
        />

        <Button
          title="Login"
          onPress={handleLogin}
          loading={isLoading}
          size="lg"
          style={styles.loginButton}
        />

        <View style={styles.registerRow}>
          <Text style={styles.helpText}>Don't have an account? </Text>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Register here</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
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
    backgroundColor: 'rgba(200,162,77,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: 'rgba(200,162,77,0.3)',
  },
  title: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 1,
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
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  helpText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
  },
  registerLink: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
});
