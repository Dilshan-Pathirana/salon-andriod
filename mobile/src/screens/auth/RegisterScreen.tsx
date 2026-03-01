import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../components';
import { useAuthStore } from '../../store';
import { COLORS, FONTS, SPACING } from '../../constants';
import { isValidPhone, isValidPassword } from '../../utils';
import { AxiosError } from 'axios';

interface Props {
  navigation: any;
}

export function RegisterScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Input refs for field chaining
  const lastNameInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmInputRef = useRef<TextInput>(null);

  const { login } = useAuthStore();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';

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

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { authApi } = require('../../services');
      await authApi.register({
        phoneNumber,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      // Auto-login after registration
      await login(phoneNumber, password);
    } catch (error) {
      let message = 'Registration failed. Please try again.';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      Alert.alert('Registration Failed', message);
    } finally {
      setIsLoading(false);
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
              <Ionicons name="person-add" size={36} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join our premium salon</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <Input
                  label="First Name"
                  placeholder="First name"
                  value={firstName}
                  onChangeText={setFirstName}
                  leftIcon="person-outline"
                  error={errors.firstName}
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameInputRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>

              <View style={styles.nameField}>
                <Input
                  ref={lastNameInputRef}
                  label="Last Name"
                  placeholder="Last name"
                  value={lastName}
                  onChangeText={setLastName}
                  leftIcon="person-outline"
                  error={errors.lastName}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneInputRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>
            </View>

            <Input
              ref={phoneInputRef}
              label="Phone Number"
              placeholder="Enter 10-digit phone number"
              value={phoneNumber}
              onChangeText={(t) => setPhoneNumber(t.replace(/[^0-9]/g, '').slice(0, 10))}
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
              placeholder="Min. 8 characters"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon="lock-closed-outline"
              error={errors.password}
              returnKeyType="next"
              onSubmitEditing={() => confirmInputRef.current?.focus()}
              blurOnSubmit={false}
            />

            <Input
              ref={confirmInputRef}
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              leftIcon="lock-closed-outline"
              error={errors.confirmPassword}
              returnKeyType="go"
              onSubmitEditing={handleRegister}
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              size="lg"
              icon="person-add-outline"
              style={styles.registerButton}
            />

            <Button
              title="Already have an account? Login"
              onPress={() => navigation.navigate('Login')}
              variant="ghost"
              style={styles.loginLink}
            />
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
    paddingVertical: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(200,162,77,0.2)',
  },
  title: {
    fontSize: FONTS.sizes.xxl,
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
  nameRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  nameField: {
    flex: 1,
  },
  registerButton: {
    marginTop: SPACING.md,
  },
  loginLink: {
    marginTop: SPACING.md,
  },
});
