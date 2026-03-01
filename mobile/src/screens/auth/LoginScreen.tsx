import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="cut" size={44} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>L'Atelier</Text>
            <Text style={styles.subtitle}>Modern Grooming Experience</Text>
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
              icon="log-in-outline"
              style={styles.loginButton}
            />

            <View style={styles.registerRow}>
              <Text style={styles.helpText}>Don't have an account? </Text>
              <Pressable onPress={() => navigation.navigate('Register')} hitSlop={8}>
                <Text style={styles.registerLink}>Register here</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl + 8,
  },
  iconContainer: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(194,173,144,0.2)',
  },
  title: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '600',
    color: COLORS.champagne,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  form: {
    width: '100%',
  },
  loginButton: {
    marginTop: SPACING.md,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xxl,
  },
  helpText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
  },
  registerLink: {
    color: COLORS.champagne,
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
