import React from 'react';
import { View, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { COLORS, LAYOUT } from '../styles/theme';

type Props = {
  children?: React.ReactNode;
  scrollable?: boolean;
};

export default function ScreenContainer({ children, scrollable = true }: Props) {
  if (scrollable) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, padding: LAYOUT.pagePadding, alignItems: 'center' },
});