// src/components/DatePickerField.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { COLORS, LAYOUT } from '../styles/theme';

type Props = {
  label?: string;
  value?: string; // Format: MM/DD/YYYY
  onChange?: (val: string) => void;
  error?: string | null;
  placeholder?: string;
};

export default function DatePickerField({
  label,
  value = '',
  onChange,
  error,
  placeholder = 'MM/DD/YYYY',
}: Props) {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const parseValue = () => {
    const fallback = new Date();
    fallback.setFullYear(fallback.getFullYear() - 18);
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return fallback;
    const [month, day, year] = value.split('/').map(Number);
    const parsed = new Date(year, month - 1, day);
    return parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day &&
      year >= 1900 &&
      parsed <= new Date()
      ? parsed
      : fallback;
  };

  // Helper to format Date object to MM/DD/YYYY
  const formatDate = (date: Date) => {
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  // NATIVE: Handle picker confirm
  const handleConfirm = (date: Date) => {
    setDatePickerVisibility(false);
    if (onChange) onChange(formatDate(date));
  };

  const openPicker = () => {
    Keyboard.dismiss();
    setDatePickerVisibility(true);
  };

  return (
    <View style={styles.wrapperOuter}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TouchableOpacity
        activeOpacity={1}
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={`${label || 'Date of birth'}, ${value || 'Choose date'}`}
        style={[styles.inputRow, error ? { borderColor: COLORS.error } : null]}
      >
        <TextInput
          style={styles.input}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#7A7A7A"
          keyboardType="number-pad"
          maxLength={10}
          editable={false}
          pointerEvents="none"
        />

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Choose date of birth"
          onPress={openPicker}
          style={styles.iconWrap}
        >
          <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>

      {error ? <Text style={styles.err}>{error}</Text> : null}

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
        // Default to 18 years ago for convenience
        date={parseValue()}
        maximumDate={new Date()}
        minimumDate={new Date(1900, 0, 1)}
      />
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
