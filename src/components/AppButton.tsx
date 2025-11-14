import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, LAYOUT } from '../styles/theme';

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
  style?: ViewStyle | ViewStyle[];
};

export default function AppButton({ title, onPress, disabled, variant = 'primary', style }: Props) {
  const bg =
    variant === 'primary' ? COLORS.accent :
    variant === 'danger' ? COLORS.panic : 'transparent';

  const border = variant === 'ghost' ? { borderWidth: 1, borderColor: '#222' } : {};

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, { backgroundColor: bg, opacity: disabled ? 0.6 : 1 }, border, style]}
    >
      <Text style={[styles.txt, variant === 'ghost' ? { color: COLORS.textPrimary } : { color: '#0A0A0A' }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: LAYOUT.controlHeight,
    borderRadius: LAYOUT.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  txt: { fontWeight: '800', fontSize: 16 },
});