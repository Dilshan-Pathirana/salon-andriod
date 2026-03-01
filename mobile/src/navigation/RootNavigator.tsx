import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store';
import { Loading } from '../components';
import { AuthNavigator } from './AuthNavigator';
import { ClientTabNavigator } from './ClientTabNavigator';
import { AdminTabNavigator } from './AdminTabNavigator';

export type RootStackParamList = {
  Auth: undefined;
  MainDrawer: undefined;
  AdminTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return <Loading message="Loading..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : user?.role === 'ADMIN' ? (
        <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
      ) : (
        <Stack.Screen name="MainDrawer" component={ClientTabNavigator} />
      )}
    </Stack.Navigator>
  );
}
