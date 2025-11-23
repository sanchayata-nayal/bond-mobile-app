// App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import AppNavigation from './src/navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './src/styles/theme';

// Define the deep dark theme for the navigator
const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background, // #0F150D
    card: COLORS.background,
    text: COLORS.textPrimary,
    border: 'transparent',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={AppTheme}>
        <AppNavigation />
      </NavigationContainer>

      <StatusBar style="light" backgroundColor={COLORS.background} />
    </SafeAreaProvider>
  );
}