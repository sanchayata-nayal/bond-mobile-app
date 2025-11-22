// src/components/ScreenContainer.tsx
import React from 'react';
import { View, SafeAreaView, ScrollView, StyleSheet, Dimensions, Platform } from 'react-native';
import { COLORS, LAYOUT } from '../styles/theme';

type Props = {
  children?: React.ReactNode;
  scrollable?: boolean;
};

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

export default function ScreenContainer({ children, scrollable = true }: Props) {
  if (scrollable) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={[styles.container, { minHeight: WINDOW_HEIGHT }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, { minHeight: WINDOW_HEIGHT }]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  // IMPORTANT: use flex-start alignment here; child screens will control centering
  container: {
    flexGrow: 1,
    flex: 1,
    padding: LAYOUT.pagePadding,
    alignItems: 'center',
    justifyContent: 'flex-start',
    // small platform tweak for web to make sure scrolling works nicely
    ...(Platform.OS === 'web' ? { WebkitOverflowScrolling: 'touch' as any } : {}),
  },
});
