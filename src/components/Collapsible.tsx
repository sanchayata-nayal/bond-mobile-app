import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';

type Props = {
  title: string;
  startOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

export default function Collapsible({ title, startOpen = false, open, onOpenChange, children }: Props) {
  const [internalOpen, setInternalOpen] = useState(startOpen);
  const isOpen = open ?? internalOpen;

  const toggleOpen = () => {
    const nextOpen = !isOpen;
    if (open === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  return (
    <View style={{ marginBottom: 12 }}>
      <TouchableOpacity style={styles.header} onPress={toggleOpen}>
        <Text style={styles.title}>{title}</Text>
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textSecondary} />
      </TouchableOpacity>
      {isOpen ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  title: { color: COLORS.textPrimary, fontWeight: '700' },
  body: { paddingVertical: 8 },
});
