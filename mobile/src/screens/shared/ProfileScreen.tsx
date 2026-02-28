import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useAuthStore } from '../../store';
import { usersService } from '../../services';
import { Button, Loading, ConfirmDialog } from '../../components';
import { COLORS, FONTS, SPACING } from '../../constants';
import { AxiosError } from 'axios';

export function ProfileScreen() {
  const { user, setUser, logout } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleUpdateProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Validation', 'First and last name are required');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, string> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      };

      if (newPassword) {
        if (!currentPassword) {
          Alert.alert('Validation', 'Current password is required to change password');
          setSaving(false);
          return;
        }
        if (newPassword.length < 6) {
          Alert.alert('Validation', 'New password must be at least 6 characters');
          setSaving(false);
          return;
        }
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const updated = await usersService.updateProfile(payload);
      setUser(updated);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      let message = 'Failed to update profile';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // logout anyway
    } finally {
      setLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  if (!user) {
    return <Loading message="Loading profile..." />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.firstName[0]}{user.lastName[0]}
          </Text>
        </View>
        <Text style={styles.fullName}>{user.firstName} {user.lastName}</Text>
        <View style={[styles.roleBadge, user.role === 'ADMIN' ? styles.roleAdmin : styles.roleClient]}>
          <Text style={[styles.roleText, user.role === 'ADMIN' ? styles.roleTextAdmin : styles.roleTextClient]}>
            {user.role}
          </Text>
        </View>
      </View>

      {/* Profile Form */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <Text style={styles.fieldLabel}>Phone</Text>
        <View style={styles.readOnlyField}>
          <Text style={styles.readOnlyText}>{user.phoneNumber}</Text>
          <Text style={styles.readOnlyHint}>Cannot be changed</Text>
        </View>

        <Text style={styles.fieldLabel}>First Name</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
          placeholderTextColor={COLORS.textLight}
        />

        <Text style={styles.fieldLabel}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name"
          placeholderTextColor={COLORS.textLight}
        />
      </View>

      {/* Password Change */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <Text style={styles.sectionSubtitle}>Leave blank to keep current password</Text>

        <Text style={styles.fieldLabel}>Current Password</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Current password"
          secureTextEntry
          placeholderTextColor={COLORS.textLight}
        />

        <Text style={styles.fieldLabel}>New Password</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="New password (min. 6 chars)"
          secureTextEntry
          placeholderTextColor={COLORS.textLight}
        />
      </View>

      <Button
        title="Save Changes"
        onPress={handleUpdateProfile}
        loading={saving}
        style={styles.saveButton}
      />

      <Button
        title="Logout"
        variant="danger"
        onPress={() => setShowLogoutConfirm(true)}
        style={styles.logoutButton}
      />

      <ConfirmDialog
        visible={showLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        loading={loggingOut}
      />

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200,162,77,0.15)',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(200,162,77,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'rgba(200,162,77,0.3)',
  },
  avatarText: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  fullName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  roleBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: SPACING.sm,
  },
  roleAdmin: {
    backgroundColor: COLORS.primary + '20',
  },
  roleClient: {
    backgroundColor: COLORS.surfaceSecondary,
  },
  roleText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
  },
  roleTextAdmin: {
    color: COLORS.primary,
  },
  roleTextClient: {
    color: COLORS.textSecondary,
  },
  formSection: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    marginBottom: 0,
    padding: SPACING.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  readOnlyField: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readOnlyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  readOnlyHint: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
  },
  saveButton: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  logoutButton: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  spacer: {
    height: SPACING.xxxl,
  },
});
