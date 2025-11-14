import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, LAYOUT } from '../styles/theme';

type Props = {
  label?: string;
  value?: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
  error?: string | null;
};

export default function PasswordInput({ label, value, onChangeText, placeholder, error }: Props) {
  const [show, setShow] = useState(false);
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.wrapper, error ? { borderColor: COLORS.error } : null]}>
        <TextInput
          secureTextEntry={!show}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#7A7A7A"
          style={styles.input}
        />
        <TouchableOpacity onPress={() => setShow(s => !s)} style={{ paddingHorizontal: 12 }}>
          <Ionicons name={show ? 'eye-off' : 'eye'} size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.err}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: COLORS.textSecondary, marginBottom: 8, fontSize: 13 },
  wrapper: { height: LAYOUT.controlHeight, borderRadius: LAYOUT.borderRadius, flexDirection: 'row', alignItems: 'center', backgroundColor: '#0C0E0B', borderWidth: 1, borderColor: 'transparent' },
  input: { flex: 1, paddingHorizontal: 12, color: COLORS.textPrimary, fontSize: 16, height: '100%' },
  err: { color: COLORS.error, marginTop: 6, fontSize: 12 },
});
