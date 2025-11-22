// src/components/DatePickerField.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, LAYOUT } from '../styles/theme';

type Props = {
  label?: string;
  value?: string; // expected format DD/MM/YYYY
  onChange?: (val: string) => void;
  error?: string | null;
  placeholder?: string;
  style?: any;
  // allow keyboardType prop if parent wants it
  keyboardType?: any;
};

const DATE_RE = /^([0-3]?\d)\/([01]?\d)\/(\d{4})$/;

export default function DatePickerField({
  label,
  value = '',
  onChange,
  error,
  placeholder = 'DD/MM/YYYY',
  style,
  keyboardType = Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'number-pad',
}: Props) {
  const [text, setText] = useState(value);

  useEffect(() => {
    // keep internal text in sync if parent updates value programmatically
    setText(value ?? '');
  }, [value]);

  // optional small formatter: add slashes as user types: 2 -> 2, 2+1 -> 02/...
  const handleChange = (t: string) => {
    // allow only digits and slash
    let cleaned = t.replace(/[^\d\/]/g, '');

    // auto-insert slashes for convenience
    if (cleaned.length === 2 && text.length === 1 && !cleaned.includes('/')) {
      cleaned = cleaned + '/';
    } else if (cleaned.length === 5 && text.length === 4 && !cleaned.includes('/', 3)) {
      cleaned = cleaned + '/';
    }

    // limit length to 10 (DD/MM/YYYY)
    if (cleaned.length > 10) cleaned = cleaned.slice(0, 10);

    setText(cleaned);
    onChange?.(cleaned);
  };

  // optional helper to show a calendar icon or open native picker in future
  const openNative = () => {
    // placeholder hook: later we can open a native date picker here
  };

  const isPlaceholderVisible = !text || text.length === 0;

  return (
    <View style={[style, styles.wrapperOuter]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={[styles.inputRow]}>
        <TextInput
          value={text}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor="#7A7A7A"
          style={styles.input}
          keyboardType={keyboardType}
          returnKeyType="done"
          underlineColorAndroid="transparent"
        />

        <TouchableOpacity onPress={openNative} activeOpacity={0.7} style={styles.iconWrap}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.err}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapperOuter: { marginBottom: 14, width: '100%' },
  label: { color: COLORS.textSecondary, marginBottom: 8, fontSize: 13 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: LAYOUT.borderRadius,
    backgroundColor: '#0C0E0B',
    borderWidth: 1,
    borderColor: 'transparent',
    height: LAYOUT.controlHeight,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    color: COLORS.textPrimary,
    fontSize: 16,
    height: '100%',
  },
  iconWrap: {
    paddingHorizontal: 12,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  err: { color: COLORS.error, marginTop: 6, fontSize: 12 },
});
