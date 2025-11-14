import React, { useRef } from 'react';
import { TextInput, View, Text, StyleSheet, Animated, Platform, ViewStyle } from 'react-native';
import { COLORS, LAYOUT } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  label?: string;
  error?: string | null;
  icon?: string; // Ionicons name
  style?: ViewStyle | ViewStyle[];
  onFocus?: (...args: any[]) => void;
  onBlur?: (...args: any[]) => void;
  [k: string]: any;
};

export default function AppInput({ label, error, style, onFocus, onBlur, icon, ...rest }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  const handleFocus = (e: any) => {
    Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: false }).start();
    onFocus?.(e);
  };
  const handleBlur = (e: any) => {
    Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: false }).start();
    onBlur?.(e);
  };

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', COLORS.accent],
  });

  return (
    <View style={[style, styles.wrapperOuter]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Animated.View style={[styles.wrapper, { borderColor }, error ? styles.inputError : null]}>
        {icon ? <Ionicons name={icon as any} size={20} color={COLORS.textSecondary} style={{ marginLeft: 12 }} /> : null}
        <TextInput
          {...rest}
          style={[styles.input]}
          placeholderTextColor="#7A7A7A"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </Animated.View>
      {error ? <Text style={styles.err}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapperOuter: { marginBottom: 14 },
  label: { color: COLORS.textSecondary, marginBottom: 8, fontSize: 13 },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: LAYOUT.borderRadius,
    overflow: 'hidden',
    backgroundColor: '#0C0E0B',
    height: LAYOUT.controlHeight,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  err: { color: COLORS.error, marginTop: 6, fontSize: 12 },
  inputError: { borderColor: COLORS.error },
});
