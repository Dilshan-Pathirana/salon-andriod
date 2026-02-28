import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { QueueManagementScreen } from '../screens/admin/QueueManagementScreen';
import { CalendarManagementScreen } from '../screens/admin/CalendarManagementScreen';
import { AppointmentManagementScreen } from '../screens/admin/AppointmentManagementScreen';
import { UserManagementScreen } from '../screens/admin/UserManagementScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';

export type AdminTabParamList = {
  Dashboard: undefined;
  QueueMgmt: undefined;
  CalendarMgmt: undefined;
  Appointments: undefined;
  Users: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

export function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.textWhite,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="QueueMgmt"
        component={QueueManagementScreen}
        options={{
          title: 'Queue',
          headerTitle: 'Queue Management',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CalendarMgmt"
        component={CalendarManagementScreen}
        options={{
          title: 'Calendar',
          headerTitle: 'Calendar Management',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentManagementScreen}
        options={{
          title: 'Appts',
          headerTitle: 'Appointments',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="clipboard-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Users"
        component={UserManagementScreen}
        options={{
          title: 'Users',
          headerTitle: 'User Management',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
