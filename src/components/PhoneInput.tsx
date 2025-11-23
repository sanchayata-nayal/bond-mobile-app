// src/components/PhoneInput.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Platform } from 'react-native';
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

const COMMON_COUNTRIES = [
  { label: 'United States', code: '+1', flag: '🇺🇸' },
  { label: 'Canada', code: '+1', flag: '🇨🇦' },
  { label: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { label: 'Australia', code: '+61', flag: '🇦🇺' },
  { label: 'India', code: '+91', flag: '🇮🇳' },
  { label: 'Germany', code: '+49', flag: '🇩🇪' },
];

export default function PhoneInput({ 
  value = '', 
  onChange, 
  countryCode = '+1', 
  onCountryChange, 
  placeholder, 
  error, 
  maxLength = 10 
}: Props) {
  const [openCountries, setOpenCountries] = useState(false);
  
  // Track selected country object
  const [selectedCountry, setSelectedCountry] = useState(
    COMMON_COUNTRIES.find(c => c.code === countryCode) || COMMON_COUNTRIES[0]
  );

  // Sync if prop changes
  useEffect(() => {
    if (countryCode !== selectedCountry.code) {
      const match = COMMON_COUNTRIES.find(c => c.code === countryCode);
      if (match) setSelectedCountry(match);
    }
  }, [countryCode]);

  const handleSelect = (country: typeof COMMON_COUNTRIES[0]) => {
    setSelectedCountry(country);
    onCountryChange?.(country.code);
    setOpenCountries(false);
  };

  function setNum(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, maxLength);
    onChange(digits);
  }

  return (
    <View style={{ marginBottom: 14, zIndex: openCountries ? 5000 : 1 }}>
      <View style={[styles.row, error ? { borderColor: COLORS.error } : null]}>
        {/* Country Code Selector */}
        <TouchableOpacity 
          style={styles.codeBtn} 
          onPress={() => setOpenCountries(s => !s)}
          activeOpacity={0.7}
        >
          <Text style={styles.flag}>{selectedCountry.flag}</Text>
          <Text style={styles.codeText}>{selectedCountry.code}</Text>
          <Ionicons name={openCountries ? 'chevron-up' : 'chevron-down'} size={12} color={COLORS.textSecondary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.vertDivider} />

        {/* Input */}
        <TextInput
          keyboardType="phone-pad"
          value={value}
          onChangeText={setNum}
          placeholder={placeholder || "Phone number"}
          placeholderTextColor="#7A7A7A"
          style={styles.input}
        />
      </View>

      {/* Dropdown */}
      {openCountries && (
        <View style={styles.dropdownContainer}>
          <ScrollView 
            style={styles.scroll} 
            nestedScrollEnabled 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            {COMMON_COUNTRIES.map((c) => (
              <TouchableOpacity 
                key={c.label} 
                style={[styles.countryRow, c.label === selectedCountry.label && { backgroundColor: 'rgba(255,255,255,0.08)' }]} 
                onPress={() => handleSelect(c)}
              >
                <Text style={styles.rowFlag}>{c.flag}</Text>
                <Text style={styles.rowLabel}>{c.label}</Text>
                <Text style={styles.rowCode}>{c.code}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {error ? <Text style={styles.err}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#0C0E0B', 
    borderRadius: LAYOUT.borderRadius, 
    height: LAYOUT.controlHeight, 
    borderWidth: 1, 
    borderColor: 'transparent' 
  },
  codeBtn: { 
    paddingHorizontal: 12, 
    height: '100%', 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center'
  },
  flag: { fontSize: 16, marginRight: 6 },
  codeText: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 14 },
  vertDivider: { width: 1, height: '60%', backgroundColor: '#2A3028' },
  input: { 
    flex: 1, 
    height: '100%', 
    paddingHorizontal: 12, 
    color: COLORS.textPrimary, 
    fontSize: 16 
  },
  
  /* Dropdown Styles */
  dropdownContainer: { 
    position: 'absolute', 
    top: LAYOUT.controlHeight + 4, 
    left: 0, right: 0, 
    backgroundColor: '#141812', 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#2A3028', 
    height: 200, // Explicit height helps scrolling
    zIndex: 5000,
    elevation: 10,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 8px 20px rgba(0,0,0,0.5)' } as any
    })
  },
  scroll: {
    flex: 1,
  },
  countryRow: { 
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#1F241D' 
  },
  rowFlag: { fontSize: 18, marginRight: 12 },
  rowLabel: { color: COLORS.textPrimary, flex: 1, fontSize: 14 },
  rowCode: { color: COLORS.accent, fontWeight: '700', fontSize: 13 },
  
  err: { color: COLORS.error, marginTop: 6, fontSize: 12 },
});