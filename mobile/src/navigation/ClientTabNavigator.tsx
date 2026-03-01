import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { CustomDrawerContent } from './CustomDrawerContent';
import { LandingScreen } from '../screens/client/LandingScreen';
import { ServicesScreen } from '../screens/client/ServicesScreen';
import { BookAppointmentScreen } from '../screens/client/BookAppointmentScreen';
import { GalleryScreen } from '../screens/client/GalleryScreen';
import { ReviewsScreen } from '../screens/client/ReviewsScreen';
import { AboutScreen } from '../screens/client/AboutScreen';
import { MyAppointmentsScreen } from '../screens/client/MyAppointmentsScreen';
import { LiveQueueScreen } from '../screens/client/LiveQueueScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';

export type ClientDrawerParamList = {
  Landing: undefined;
  Services: undefined;
  Book: undefined;
  Gallery: undefined;
  Reviews: undefined;
  LiveQueue: undefined;
  MyAppointments: undefined;
  About: undefined;
  Profile: undefined;
};

const Drawer = createDrawerNavigator<ClientDrawerParamList>();

function HamburgerButton({ navigation }: { navigation: any }) {
  return (
    <TouchableOpacity
      onPress={() => navigation.toggleDrawer()}
      style={{ marginLeft: 16, padding: 4 }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="menu" size={26} color={COLORS.gold} />
    </TouchableOpacity>
  );
}

export function ClientTabNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        drawerType: 'front',
        drawerStyle: {
          backgroundColor: COLORS.background,
          width: 300,
        },
        headerStyle: {
          backgroundColor: COLORS.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(200,162,77,0.1)',
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: '600',
          letterSpacing: 0.8,
          color: COLORS.text,
        },
        headerShadowVisible: false,
        headerLeft: () => <HamburgerButton navigation={navigation} />,
        overlayColor: 'rgba(0,0,0,0.6)',
      })}
    >
      <Drawer.Screen
        name="Landing"
        component={LandingScreen}
        options={{ headerShown: false, title: 'Home' }}
      />
      <Drawer.Screen
        name="Services"
        component={ServicesScreen}
        options={{ headerTitle: 'Our Services' }}
      />
      <Drawer.Screen
        name="Book"
        component={BookAppointmentScreen}
        options={{ headerTitle: 'Book Appointment' }}
      />
      <Drawer.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{ headerTitle: 'Our Work' }}
      />
      <Drawer.Screen
        name="Reviews"
        component={ReviewsScreen}
        options={{ headerTitle: 'Reviews' }}
      />
      <Drawer.Screen
        name="LiveQueue"
        component={LiveQueueScreen}
        options={{ headerTitle: 'Live Queue' }}
      />
      <Drawer.Screen
        name="MyAppointments"
        component={MyAppointmentsScreen}
        options={{ headerTitle: 'My Appointments' }}
      />
      <Drawer.Screen
        name="About"
        component={AboutScreen}
        options={{ headerTitle: 'About Us' }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerTitle: 'Profile' }}
      />
    </Drawer.Navigator>
  );
}
