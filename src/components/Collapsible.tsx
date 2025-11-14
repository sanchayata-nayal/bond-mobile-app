import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';

type Props = {
  title: string;
  startOpen?: boolean;
  children?: React.ReactNode;
};

export default function Collapsible({ title, startOpen = false, children }: Props) {
  const [open, setOpen] = useState(startOpen);
  return (
    <View style={{ marginBottom: 12 }}>
      <TouchableOpacity style={styles.header} onPress={() => setOpen(s => !s)}>
        <Text style={styles.title}>{title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textSecondary} />
      </TouchableOpacity>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  title: { color: COLORS.textPrimary, fontWeight: '700' },
  body: { paddingVertical: 8 },
});