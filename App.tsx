import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigation from './src/navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './src/styles/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigation />
      </NavigationContainer>

      {/* dark background -> use light status bar content */}
      <StatusBar style="light" backgroundColor={COLORS.background} />
    </SafeAreaProvider>
  );
}
