// src/components/ConfirmationModal.tsx
import React from 'react';
import { View, Text, Modal, StyleSheet, Platform } from 'react-native';
import AppButton from './AppButton';
import { COLORS, LAYOUT } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  icon?: any;
};

export default function ConfirmationModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = '', // Default to empty to trigger single-button mode
  variant = 'primary',
  icon,
}: Props) {
  // Determine if we are in single-button mode
  const isSingleButton = !cancelText;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {icon && (
            <Ionicons 
              name={icon} 
              size={40} 
              color={variant === 'danger' ? COLORS.panic : COLORS.accent} 
              style={{ marginBottom: 16 }} 
            />
          )}
          
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.row}>
            {!isSingleButton && (
              <AppButton 
                title={cancelText} 
                onPress={onCancel} 
                variant="ghost" 
                style={{ flex: 1, marginRight: 8 }} 
              />
            )}
            
            <AppButton 
              title={confirmText} 
              onPress={onConfirm} 
              variant={variant === 'danger' ? 'danger' : 'primary'} 
              style={isSingleButton ? { width: '100%' } : { flex: 1, marginLeft: 8 }} 
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#141812',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3028',
    ...Platform.select({
      web: { boxShadow: '0 20px 50px rgba(0,0,0,0.5)' } as any,
      default: { elevation: 10 }
    })
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  }
});