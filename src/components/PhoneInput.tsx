import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { COLORS, LAYOUT } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  value?: string;
  onChange: (val: string) => void;
  countryCode?: string;
  onCountryChange?: (code: string) => void;
  placeholder?: string;
  error?: string | null;
  maxLength?: number;
};

const COMMON = [
  { label: 'United States', code: '+1' },
  { label: 'Canada', code: '+1' },
  { label: 'United Kingdom', code: '+44' },
  { label: 'Australia', code: '+61' },
];

export default function PhoneInput({ value = '', onChange, countryCode = '+1', onCountryChange, placeholder, error, maxLength = 10 }: Props) {
  const [openCountries, setOpenCountries] = useState(false);

  function setNum(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, maxLength);
    onChange(digits);
  }

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{placeholder || 'Phone number'}</Text>

      <View style={styles.row}>
        <TouchableOpacity style={styles.code} onPress={() => setOpenCountries(s => !s)}>
          <Text style={{ color: COLORS.textPrimary, fontWeight: '700' }}>{countryCode}</Text>
          <Ionicons name={openCountries ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textSecondary} style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <TextInput
          keyboardType="phone-pad"
          value={value}
          onChangeText={setNum}
          placeholder="1234567890"
          placeholderTextColor="#7A7A7A"
          style={styles.input}
        />
      </View>

      {openCountries ? (
        <View style={styles.countryList}>
          {COMMON.map(c => (
            <TouchableOpacity key={c.code} style={styles.countryRow} onPress={() => { onCountryChange?.(c.code); setOpenCountries(false); }}>
              <Text style={{ color: COLORS.textPrimary }}>{c.label}</Text>
              <Text style={{ color: COLORS.textSecondary }}>{c.code}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {error ? <Text style={styles.err}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: COLORS.textSecondary, marginBottom: 8, fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0C0E0B', borderRadius: LAYOUT.borderRadius, overflow: 'hidden', height: LAYOUT.controlHeight, borderWidth: 1, borderColor: 'transparent' },
  code: { paddingHorizontal: 12, height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderRightWidth: 1, borderRightColor: '#0A0A0A' },
  input: { flex: 1, height: '100%', paddingHorizontal: 12, color: COLORS.textPrimary, fontSize: 16 },
  countryList: { marginTop: 8, backgroundColor: '#0B0B0B', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#0A0A0A' },
  countryRow: { padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  err: { color: COLORS.error, marginTop: 6, fontSize: 12 },
});