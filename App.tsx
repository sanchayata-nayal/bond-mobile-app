// App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import AppNavigation from './src/navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './src/styles/theme';

// Create a strict Dark Theme for the navigator
const AppTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.accent,
    background: COLORS.background, // Forces dark background everywhere
    card: COLORS.background,
    text: COLORS.textPrimary,
    border: 'transparent',
    notification: COLORS.accent,
  },
};

export default function App() {
  return (
    <SafeAreaProvider style={{ backgroundColor: COLORS.background }}>
      <NavigationContainer theme={AppTheme}>
        <AppNavigation />
      </NavigationContainer>

      {/* Force light text on status bar (for dark background) */}
      <StatusBar style="light" backgroundColor={COLORS.background} />
    </SafeAreaProvider>
  );
}