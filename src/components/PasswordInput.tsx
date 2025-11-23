// src/components/PasswordInput.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Platform, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, LAYOUT } from '../styles/theme';

type Props = TextInputProps & {
  label?: string;
  value?: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
  error?: string | null;
};

export default function PasswordInput({ label, value, onChangeText, placeholder, error, ...rest }: Props) {
  // Default to true (Visible) as requested previously
  const [show, setShow] = useState(true);

  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.wrapper, error ? { borderColor: COLORS.error } : null]}>
        <TextInput
          {...rest}
          secureTextEntry={!show}
          value={value || ''} // Prevent undefined value
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#7A7A7A"
          style={styles.input}
          
          // Stability props
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          textContentType="none"
          importantForAutofill="no"
          autoComplete="off"
          
          // Android font padding fix
          {...(Platform.OS === 'android' ? { includeFontPadding: false } : {})}
        />
        <TouchableOpacity 
          onPress={() => setShow(s => !s)} 
          style={styles.eyeBtn}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={show ? 'eye' : 'eye-off'} 
            size={20} 
            color={COLORS.textSecondary} 
          />
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.err}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: COLORS.textSecondary, marginBottom: 8, fontSize: 13 },
  wrapper: { 
    height: LAYOUT.controlHeight, 
    borderRadius: LAYOUT.borderRadius, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#0C0E0B', 
    borderWidth: 1, 
    borderColor: 'transparent',
    overflow: 'hidden'
  },
  input: { 
    flex: 1, 
    paddingHorizontal: 12, 
    color: COLORS.textPrimary, 
    fontSize: 16, 
    height: '100%',
    fontVariant: ['tabular-nums'],
  },
  eyeBtn: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  err: { color: COLORS.error, marginTop: 6, fontSize: 12 },
});