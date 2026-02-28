import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { QueueManagementScreen } from '../screens/admin/QueueManagementScreen';
import { AppointmentManagementScreen } from '../screens/admin/AppointmentManagementScreen';
import { AdminManageScreen } from '../screens/admin/AdminManageScreen';
import { ServiceManagementScreen } from '../screens/admin/ServiceManagementScreen';
import { GalleryManagementScreen } from '../screens/admin/GalleryManagementScreen';
import { ReviewManagementScreen } from '../screens/admin/ReviewManagementScreen';
import { BusinessInfoManagementScreen } from '../screens/admin/BusinessInfoManagementScreen';
import { UserManagementScreen } from '../screens/admin/UserManagementScreen';
import { CalendarManagementScreen } from '../screens/admin/CalendarManagementScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';

// Manage tab stack navigator
const ManageStack = createNativeStackNavigator();

function ManageNavigator() {
  return (
    <ManageStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <ManageStack.Screen name="ManageHome" component={AdminManageScreen} options={{ headerTitle: 'Manage' }} />
      <ManageStack.Screen name="ServiceMgmt" component={ServiceManagementScreen} options={{ headerTitle: 'Services' }} />
      <ManageStack.Screen name="GalleryMgmt" component={GalleryManagementScreen} options={{ headerTitle: 'Gallery' }} />
      <ManageStack.Screen name="ReviewMgmt" component={ReviewManagementScreen} options={{ headerTitle: 'Reviews' }} />
      <ManageStack.Screen name="BusinessInfoMgmt" component={BusinessInfoManagementScreen} options={{ headerTitle: 'Business Info' }} />
      <ManageStack.Screen name="UserMgmt" component={UserManagementScreen} options={{ headerTitle: 'Users' }} />
      <ManageStack.Screen name="CalendarMgmt" component={CalendarManagementScreen} options={{ headerTitle: 'Calendar' }} />
    </ManageStack.Navigator>
  );
}

export type AdminTabParamList = {
  Dashboard: undefined;
  QueueMgmt: undefined;
  Appointments: undefined;
  Manage: undefined;
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
          borderTopColor: 'rgba(200,162,77,0.15)',
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          elevation: 0,
        },
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShadowVisible: false,
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
        name="Manage"
        component={ManageNavigator}
        options={{
          title: 'Manage',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
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
