// src/components/ScreenContainer.tsx
import React from 'react';
import { View, ScrollView, StyleSheet, Platform, ViewStyle, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, LAYOUT } from '../styles/theme';

type Props = {
  children?: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
};

export default function ScreenContainer({ children, scrollable = true, style }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      {/* Ensure status bar style matches theme */}
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {scrollable ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.inner, style]}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[styles.container, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: LAYOUT.pagePadding,
    paddingBottom: LAYOUT.pagePadding + 24,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  // For scrollable views, we use flexGrow to fill space but allow expansion
  scrollContent: {
    flexGrow: 1,
    paddingVertical: LAYOUT.pagePadding,
    paddingBottom: LAYOUT.pagePadding + 36,
    // On web, this helps with smooth momentum scrolling
    ...(Platform.OS === 'web' ? { WebkitOverflowScrolling: 'touch' as any } : {}),
  },
  inner: {
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: LAYOUT.pagePadding,
    alignItems: 'center',
  },
});
