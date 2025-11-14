import React, { useRef, useState } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { COLORS, LAYOUT } from '../styles/theme';

type Props = {
  value?: string;
  onChange: (val: string) => void;
  label?: string;
  error?: string | null;
};

export default function DatePickerField({ value, onChange, label, error }: Props) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const fmt = (date: Date) => `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;

  if (Platform.OS === 'web') {
    return (
      <View style={{ marginBottom: 12 }}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TouchableOpacity style={[styles.fakeInput, error ? styles.inputError : null]} onPress={() => inputRef.current?.showPicker?.()}>
            <Text style={styles.fakeText}>{value || 'Select date'}</Text>
          </TouchableOpacity>

          <input
            ref={(r) => { inputRef.current = r; }}
            type="date"
            defaultValue={value ? (() => {
              const [d,m,y] = value.split('/'); return `${y}-${String(Number(m)).padStart(2,'0')}-${String(Number(d)).padStart(2,'0')}`;
            })() : undefined}
            style={{
              position: 'relative',
              opacity: 0,
              height: LAYOUT.controlHeight,
              width: '100%',
            }}
            onChange={(e: any) => {
              const v = e.target.value;
              if (!v) return;
              const [y, m, d] = v.split('-');
              onChange(`${d}/${m}/${y}`);
            }}
          />
        </div>
        {error ? <Text style={styles.err}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity style={[styles.fakeInput, error ? styles.inputError : null]} onPress={() => setOpen(true)}>
        <Text style={styles.fakeText}>{value || 'Select date'}</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={open}
        mode="date"
        onConfirm={(date: Date) => {
          setOpen(false);
          onChange(fmt(date));
        }}
        onCancel={() => setOpen(false)}
        maximumDate={new Date()}
      />
      {error ? <Text style={styles.err}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: COLORS.textSecondary, marginBottom: 8, fontSize: 13 },
  fakeInput: {
    height: LAYOUT.controlHeight,
    borderRadius: LAYOUT.borderRadius,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#0C0E0B',
  },
  fakeText: { color: COLORS.textPrimary, fontSize: 16 },
  inputError: { borderColor: COLORS.error },
  err: { color: COLORS.error, marginTop: 6, fontSize: 12 },
});