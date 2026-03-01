import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { ServicesScreen } from '../screens/client/ServicesScreen';
import { BookAppointmentScreen } from '../screens/client/BookAppointmentScreen';
import { GalleryScreen } from '../screens/client/GalleryScreen';
import { ReviewsScreen } from '../screens/client/ReviewsScreen';
import { ClientMoreScreen } from '../screens/client/ClientMoreScreen';
import { AboutScreen } from '../screens/client/AboutScreen';
import { MyAppointmentsScreen } from '../screens/client/MyAppointmentsScreen';
import { LiveQueueScreen } from '../screens/client/LiveQueueScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';

// More tab stack
const MoreStack = createNativeStackNavigator();

function ClientMoreNavigator() {
  return (
    <MoreStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <MoreStack.Screen name="MoreHome" component={ClientMoreScreen} options={{ headerTitle: 'More' }} />
      <MoreStack.Screen name="About" component={AboutScreen} options={{ headerTitle: 'About Us' }} />
      <MoreStack.Screen name="MyAppointments" component={MyAppointmentsScreen} options={{ headerTitle: 'My Appointments' }} />
      <MoreStack.Screen name="LiveQueue" component={LiveQueueScreen} options={{ headerTitle: 'Live Queue' }} />
      <MoreStack.Screen name="ClientProfile" component={ProfileScreen} options={{ headerTitle: 'Profile' }} />
    </MoreStack.Navigator>
  );
}

export type ClientTabParamList = {
  Services: undefined;
  Book: undefined;
  Gallery: undefined;
  Reviews: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<ClientTabParamList>();

export function ClientTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.champagne,
        tabBarInactiveTintColor: 'rgba(242,241,237,0.4)',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        },
        tabBarStyle: {
          backgroundColor: COLORS.background + 'F2',
          borderTopColor: COLORS.brown,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 68,
          elevation: 0,
        },
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: '600',
          letterSpacing: 0.8,
        },
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen
        name="Services"
        component={ServicesScreen}
        options={{
          title: 'Services',
          headerTitle: 'Our Services',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pricetag-outline" size={size} color={color} />
          ),
        }}
      />
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
        name="Gallery"
        component={GalleryScreen}
        options={{
          title: 'Gallery',
          headerTitle: 'Our Work',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="images-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Reviews"
        component={ReviewsScreen}
        options={{
          title: 'Reviews',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="star-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={ClientMoreNavigator}
        options={{
          title: 'More',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ellipsis-horizontal" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
