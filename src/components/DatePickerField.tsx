// src/components/DatePickerField.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform, Keyboard } from 'react-native';
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

  // WEB/TEXT: Auto-mask input as MM/DD/YYYY
  const handleTextChange = (text: string) => {
    // Remove non-numeric characters
    let cleaned = text.replace(/[^0-9]/g, '');
    
    // Enforce max length (8 digits -> 10 chars)
    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);

    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    if (cleaned.length > 4) {
      formatted = `${formatted.slice(0, 5)}/${cleaned.slice(4)}`;
    }

    onChange?.(formatted);
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
        onPress={Platform.OS !== 'web' ? openPicker : undefined} // Only open picker on native
        style={[styles.inputRow, error ? { borderColor: COLORS.error } : null]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#7A7A7A"
          keyboardType="number-pad"
          maxLength={10}
          editable={Platform.OS === 'web'} // Read-only on mobile (use picker)
          pointerEvents={Platform.OS === 'web' ? 'auto' : 'none'} // Pass touches through to parent on mobile
        />
        
        <TouchableOpacity onPress={openPicker} style={styles.iconWrap}>
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
        date={value && value.length === 10 ? new Date(value) : new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
        maximumDate={new Date()}
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