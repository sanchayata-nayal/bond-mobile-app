// src/components/DashboardHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';

type Props = {
  title?: string;
  onMenuPress?: () => void;
  onBackPress?: () => void;
  userInitial?: string;
  showBack?: boolean;
};

export default function DashboardHeader({ 
  title = 'All State Bail Bond Services', 
  onMenuPress, 
  onBackPress,
  userInitial = 'U',
  showBack = false
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity onPress={onBackPress} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
        
        {!showBack && (
          <View style={styles.iconBg}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.background} />
          </View>
        )}

        <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
          {title}
        </Text>
      </View>

      {onMenuPress && (
        <TouchableOpacity onPress={onMenuPress} style={styles.profileBtn} activeOpacity={0.7}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitial.charAt(0).toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
    paddingHorizontal: 4, 
  },
  leftRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1,
    marginRight: 10,
  },
  backBtn: { marginRight: 12, padding: 4 },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 18, // Slightly smaller to fit the long name
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
    flex: 1,
  },
  profileBtn: { padding: 4 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1F241D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: 'bold',
  },
});