// src/components/ScreenContainer.tsx
import React from 'react';
import { View, SafeAreaView, ScrollView, StyleSheet, Dimensions, Platform, ViewStyle, StatusBar } from 'react-native';
import { COLORS, LAYOUT } from '../styles/theme';

type Props = {
  children?: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
};

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

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
          <View style={[styles.inner, style]}>
            {children}
          </View>
        </ScrollView>
      ) : (
        <View style={[styles.container, style]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  container: {
    flex: 1,
    padding: LAYOUT.pagePadding,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  // For scrollable views, we use flexGrow to fill space but allow expansion
  scrollContent: {
    flexGrow: 1,
    paddingVertical: LAYOUT.pagePadding,
    // On web, this helps with smooth momentum scrolling
    ...(Platform.OS === 'web' ? { WebkitOverflowScrolling: 'touch' as any } : {}),
  },
  inner: {
    width: '100%',
    paddingHorizontal: LAYOUT.pagePadding,
    alignItems: 'center',
  }
});