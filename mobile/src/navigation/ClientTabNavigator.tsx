import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { BookAppointmentScreen } from '../screens/client/BookAppointmentScreen';
import { MyAppointmentsScreen } from '../screens/client/MyAppointmentsScreen';
import { LiveQueueScreen } from '../screens/client/LiveQueueScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';

export type ClientTabParamList = {
  Book: undefined;
  MyAppointments: undefined;
  LiveQueue: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<ClientTabParamList>();

export function ClientTabNavigator() {
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
        name="Book"
        component={BookAppointmentScreen}
        options={{
          title: 'Book',
          headerTitle: 'Book Appointment',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyAppointments"
        component={MyAppointmentsScreen}
        options={{
          title: 'My Booking',
          headerTitle: 'My Appointments',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="LiveQueue"
        component={LiveQueueScreen}
        options={{
          title: 'Queue',
          headerTitle: 'Live Queue',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
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
