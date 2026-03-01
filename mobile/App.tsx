import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation';
import { useAuthStore } from './src/store';
import { Loading } from './src/components';

export default function App() {
  const { initialize } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await initialize();
      } catch {
        // initialization failed — user will see login screen
      } finally {
        setIsReady(true);
      }
    })();
  }, [initialize]);

  if (!isReady) {
    return <Loading message="Loading..." />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0C100E' }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
