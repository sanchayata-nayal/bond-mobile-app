// src/components/DashboardHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';

type Props = {
  title?: string;
  onMenuPress: () => void;
  userInitial?: string;
};

export default function DashboardHeader({ title = 'Bond', onMenuPress, userInitial = 'U' }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        {/* You can replace this Icon with the Image logo if preferred */}
        <View style={styles.iconBg}>
          <Ionicons name="shield" size={18} color={COLORS.background} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      <TouchableOpacity onPress={onMenuPress} style={styles.profileBtn} activeOpacity={0.7}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userInitial.charAt(0).toUpperCase()}</Text>
        </View>
      </TouchableOpacity>
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
  },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
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
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
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