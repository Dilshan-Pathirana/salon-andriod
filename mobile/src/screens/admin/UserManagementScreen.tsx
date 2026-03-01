import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usersService } from '../../services';
import { Button, Loading, EmptyState, ConfirmDialog } from '../../components';
import { COLORS, FONTS, SPACING } from '../../constants';
import { User } from '../../types';
import { AxiosError } from 'axios';

export function UserManagementScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);

  // Add form state
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formRole, setFormRole] = useState<'CLIENT' | 'ADMIN'>('CLIENT');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await usersService.getUsers();
      setUsers(Array.isArray(res) ? res : []);
    } catch {
      // handled
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const resetForm = () => {
    setFormPhone('');
    setFormPassword('');
    setFormFirstName('');
    setFormLastName('');
    setFormRole('CLIENT');
    setShowAddForm(false);
  };

  const handleAddUser = async () => {
    if (!formPhone || !formPassword || !formFirstName || !formLastName) {
      Alert.alert('Validation', 'All fields are required');
      return;
    }
    if (formPhone.length !== 10 || !/^\d+$/.test(formPhone)) {
      Alert.alert('Validation', 'Phone must be 10 digits');
      return;
    }
    if (formPassword.length < 6) {
      Alert.alert('Validation', 'Password must be at least 6 characters');
      return;
    }

    setAdding(true);
    try {
      await usersService.createUser({
        phone: formPhone,
        password: formPassword,
        firstName: formFirstName,
        lastName: formLastName,
        role: formRole,
      });
      Alert.alert('Success', 'User created successfully');
      resetForm();
      fetchUsers();
    } catch (error) {
      let message = 'Failed to create user';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      Alert.alert('Error', message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await usersService.deleteUser(deleteTarget);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget));
      Alert.alert('Success', 'User deleted');
    } catch (error) {
      let message = 'Failed to delete user';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      Alert.alert('Error', message);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.firstName[0]}{item.lastName[0]}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.userPhone}>{item.phone}</Text>
        </View>
        <View style={[styles.roleBadge, item.role === 'ADMIN' ? styles.roleAdmin : styles.roleClient]}>
          <Text style={[styles.roleText, item.role === 'ADMIN' ? styles.roleTextAdmin : styles.roleTextClient]}>
            {item.role}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <Button
          title="Delete"
          variant="danger"
          size="sm"
          onPress={() => setDeleteTarget(item.id)}
        />
      </View>
    </View>
  );

  if (isLoading) {
    return <Loading message="Loading users..." />;
  }

  return (
    <View style={styles.container}>
      {/* Toggle add form */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Users ({users.length})</Text>
        <Button
          title={showAddForm ? 'Cancel' : '+ Add User'}
          variant={showAddForm ? 'outline' : 'primary'}
          size="sm"
          onPress={() => (showAddForm ? resetForm() : setShowAddForm(true))}
        />
      </View>

      {/* Add Form */}
      {showAddForm && (
        <ScrollView style={styles.addForm} nestedScrollEnabled>
          <Text style={styles.formTitle}>New User</Text>

          <Text style={styles.fieldLabel}>First Name</Text>
          <TextInput
            style={styles.input}
            value={formFirstName}
            onChangeText={setFormFirstName}
            placeholder="First name"
            placeholderTextColor={COLORS.textLight}
          />

          <Text style={styles.fieldLabel}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={formLastName}
            onChangeText={setFormLastName}
            placeholder="Last name"
            placeholderTextColor={COLORS.textLight}
          />

          <Text style={styles.fieldLabel}>Phone (10 digits)</Text>
          <TextInput
            style={styles.input}
            value={formPhone}
            onChangeText={setFormPhone}
            placeholder="0501234567"
            keyboardType="phone-pad"
            maxLength={10}
            placeholderTextColor={COLORS.textLight}
          />

          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput
            style={styles.input}
            value={formPassword}
            onChangeText={setFormPassword}
            placeholder="Min. 6 characters"
            secureTextEntry
            placeholderTextColor={COLORS.textLight}
          />

          <Text style={styles.fieldLabel}>Role</Text>
          <View style={styles.roleSelector}>
            <Button
              title="CLIENT"
              variant={formRole === 'CLIENT' ? 'primary' : 'outline'}
              size="sm"
              onPress={() => setFormRole('CLIENT')}
              style={styles.roleBtn}
            />
            <Button
              title="ADMIN"
              variant={formRole === 'ADMIN' ? 'primary' : 'outline'}
              size="sm"
              onPress={() => setFormRole('ADMIN')}
              style={styles.roleBtn}
            />
          </View>

          <Button
            title="Create User"
            onPress={handleAddUser}
            loading={adding}
            style={styles.createBtn}
          />
        </ScrollView>
      )}

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={users.length === 0 ? styles.emptyContainer : styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="No Users"
            message="No users found"
          />
        }
      />

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete User"
        message="Are you sure you want to delete this user? This cannot be undone."
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200,162,77,0.15)',
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  addForm: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 12,
    maxHeight: 400,
    elevation: 2,
  },
  formTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  fieldLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '500',
    color: COLORS.champagne,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
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
  roleSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  roleBtn: {
    flex: 1,
  },
  createBtn: {
    marginTop: SPACING.lg,
  },
  listContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(200,162,77,0.2)',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.champagne,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  userPhone: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleAdmin: {
    backgroundColor: 'rgba(151,117,77,0.15)',
  },
  roleClient: {
    backgroundColor: COLORS.surfaceSecondary,
  },
  roleText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
  },
  roleTextAdmin: {
    color: COLORS.champagne,
  },
  roleTextClient: {
    color: COLORS.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
});
