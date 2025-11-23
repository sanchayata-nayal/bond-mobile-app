// src/screens/AdminLanding.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import DashboardHeader from '../components/DashboardHeader';
import { COLORS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AdminLanding({ navigation }: any) {
  
  const AdminCard = ({ title, icon, subtitle, onPress, color = COLORS.accent }: any) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconBox, { backgroundColor: color }]}>
        <Ionicons name={icon} size={28} color={COLORS.background} />
      </View>
      <View style={styles.textArea}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScreenContainer scrollable>
      <DashboardHeader 
        title="Admin Console" 
        userInitial="A" 
        onMenuPress={() => navigation.reset({ index: 0, routes: [{ name: 'Starting' }] })} 
      />

      <Text style={styles.sectionHeader}>Management</Text>

      <AdminCard 
        title="SMS & Call Recipients" 
        subtitle="Manage emergency contacts and primary agent number."
        icon="call"
        onPress={() => navigation.navigate('AdminRecipients')}
      />

      <AdminCard 
        title="User Management" 
        subtitle="View registered users, search, or remove accounts."
        icon="people"
        onPress={() => navigation.navigate('AdminUsers')}
      />

      <AdminCard 
        title="App Usage Metrics" 
        subtitle="Analytics, signups, and active user stats."
        icon="stats-chart"
        color={COLORS.panic} // Highlight metrics
        onPress={() => navigation.navigate('AdminMetrics')}
      />

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color={COLORS.textSecondary} />
        <Text style={styles.infoText}>
          Data is synced securely with Firebase. Changes made here reflect immediately for all users.
        </Text>
      </View>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1, width: '100%' },
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141812',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A3028',
  },
  iconBox: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  textArea: { flex: 1 },
  cardTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700', marginBottom: 4 },
  cardSub: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
  infoBox: { flexDirection: 'row', marginTop: 20, padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, alignItems: 'center' },
  infoText: { color: COLORS.textSecondary, fontSize: 12, marginLeft: 10, flex: 1, lineHeight: 18 },
});