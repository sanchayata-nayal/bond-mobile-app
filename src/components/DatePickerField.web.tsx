import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, LAYOUT } from '../styles/theme';

type Props = {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string | null;
  placeholder?: string;
};

// Native date inputs preserve keyboard entry and the browser's accessible calendar.
export default function DatePickerField({ label, value = '', onChange, error }: Props) {
  const [month, day, year] = value.split('/');
  const today = new Date();
  const max = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return (
    <View style={styles.outer}>
      {label && <Text style={styles.label}>{label}</Text>}
      {React.createElement('input', {
        type: 'date',
        'aria-label': label || 'Date of birth',
        'aria-invalid': !!error,
        value: year?.length === 4 ? `${year}-${month}-${day}` : '',
        min: '1900-01-01',
        max,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
          const [y, m, d] = event.target.value.split('-');
          onChange?.(y && m && d ? `${m}/${d}/${y}` : '');
        },
        style: {
          boxSizing: 'border-box',
          width: '100%',
          minWidth: 0,
          height: LAYOUT.controlHeight,
          padding: '0 12px',
          borderRadius: LAYOUT.borderRadius,
          border: `1px solid ${error ? COLORS.error : '#2A3028'}`,
          background: '#0C0E0B',
          color: COLORS.textPrimary,
          colorScheme: 'dark',
          fontSize: 16,
        },
      })}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}
const styles = StyleSheet.create({
  outer: { marginBottom: 14, width: '100%' },
  label: { color: COLORS.textSecondary, marginBottom: 8, fontSize: 13 },
  error: { color: COLORS.error, marginTop: 6, fontSize: 12 },
});
