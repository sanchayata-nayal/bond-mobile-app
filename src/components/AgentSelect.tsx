import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, LAYOUT } from '../styles/theme';

type Props = {
  label?: string;
  value?: string;
  options: string[];
  onChange: (value: string) => void;
  optionLabels?: Record<string, string>;
  placeholder?: string;
  error?: string | null;
  style?: ViewStyle | ViewStyle[];
};

export default function AgentSelect({
  label = 'Agent Name',
  value,
  options,
  onChange,
  optionLabels = {},
  placeholder = 'Select agent',
  error,
  style,
}: Props) {
  const [open, setOpen] = useState(false);
  const normalizedValue = value?.trim() || '';

  const agentOptions = useMemo(() => {
    const cleaned = options.map((option) => option.trim()).filter(Boolean);
    const unique = Array.from(new Set(cleaned));
    return normalizedValue && !unique.includes(normalizedValue)
      ? [normalizedValue, ...unique]
      : unique;
  }, [normalizedValue, options]);

  const handleSelect = (agent: string) => {
    onChange(agent);
    setOpen(false);
  };
  const getOptionLabel = (agent: string) => optionLabels[agent] || agent;

  return (
    <View style={[styles.outer, open ? styles.outerOpen : null, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        style={[
          styles.trigger,
          open ? styles.triggerActive : null,
          error ? styles.triggerError : null,
        ]}
        onPress={() => setOpen((current) => !current)}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: open }}
        activeOpacity={0.8}
      >
        <View style={styles.triggerLeft}>
          <Ionicons name="business-outline" size={20} color={COLORS.textSecondary} />
          <Text style={[styles.triggerText, !normalizedValue ? styles.placeholder : null]}>
            {normalizedValue ? getOptionLabel(normalizedValue) : placeholder}
          </Text>
        </View>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={COLORS.textSecondary}
        />
      </TouchableOpacity>

      {open ? (
        <Modal transparent visible animationType="fade" onRequestClose={() => setOpen(false)}>
          <Pressable
            style={styles.overlay}
            onPress={() => setOpen(false)}
            accessibilityLabel="Close agent list"
          >
            <Pressable style={styles.menu} onPress={() => {}} accessibilityViewIsModal>
              <Text style={styles.menuTitle}>{label || 'Select agent'}</Text>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                showsVerticalScrollIndicator={agentOptions.length > 4}
              >
                {agentOptions.length === 0 ? (
                  <Text style={styles.emptyText}>No agents available</Text>
                ) : (
                  agentOptions.map((agent, index) => {
                    const active = agent === normalizedValue;
                    return (
                      <TouchableOpacity
                        key={`${agent}-${index}`}
                        style={[styles.item, active ? styles.itemActive : null]}
                        onPress={() => handleSelect(agent)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.itemText, active ? styles.itemTextActive : null]}>
                          {getOptionLabel(agent)}
                        </Text>
                        {active ? (
                          <Ionicons name="checkmark-circle" size={18} color={COLORS.background} />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setOpen(false)}
                style={styles.item}
                accessibilityRole="button"
              >
                <Text style={styles.itemText}>Cancel</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}

      {error ? <Text style={styles.err}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { marginBottom: 14, position: 'relative', zIndex: 1 },
  outerOpen: { zIndex: 8000, elevation: 8000 },
  label: { color: COLORS.textSecondary, marginBottom: 8, fontSize: 13 },
  trigger: {
    height: LAYOUT.controlHeight,
    borderRadius: LAYOUT.borderRadius,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#0C0E0B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  triggerActive: { borderColor: COLORS.accent },
  triggerError: { borderColor: COLORS.error },
  triggerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  triggerText: { color: COLORS.textPrimary, fontSize: 16, marginLeft: 10 },
  placeholder: { color: '#7A7A7A' },
  menu: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '70%',
    backgroundColor: '#141812',
    borderWidth: 1,
    borderColor: '#2A3028',
    borderRadius: LAYOUT.borderRadius,
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: { color: COLORS.accent, padding: 16, fontSize: 18, fontWeight: '700' },
  item: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#2A3028',
  },
  itemActive: { backgroundColor: COLORS.accent },
  itemText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  itemTextActive: { color: COLORS.background },
  emptyText: { color: COLORS.textSecondary, padding: 16, textAlign: 'center' },
  err: { color: COLORS.error, marginTop: 6, fontSize: 12 },
});
