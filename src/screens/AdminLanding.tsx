// src/screens/AdminLanding.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import DashboardHeader from '../components/DashboardHeader';
import { COLORS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AdminLanding({ navigation }: any) {
  
  const AdminCard = ({ title, icon, subtitle, onPress, color }: any) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconBox, { backgroundColor: color }]}>
        <Ionicons name={icon} size={28} color="#000" /> 
        {/* Icons are black on colored background for high contrast */}
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

      <Text style={styles.sectionHeader}>System Configuration</Text>

      <AdminCard 
        title="SMS & Call Routing" 
        subtitle="Configure primary emergency dialer and SMS broadcast list."
        icon="git-network-outline"
        color="#4A90E2" // Cyan/Blue
        onPress={() => navigation.navigate('AdminRecipients')}
      />

      <AdminCard 
        title="User Management" 
        subtitle="Monitor registered users, search details, or remove accounts."
        icon="people-outline"
        color="#BD10E0" // Violet
        onPress={() => navigation.navigate('AdminUsers')}
      />

      <AdminCard 
        title="Live Metrics" 
        subtitle="Real-time analytics on signups and panic triggers."
        icon="bar-chart-outline"
        color="#F5A623" // Amber (Warning/Caution but not Panic Red)
        onPress={() => navigation.navigate('AdminMetrics')}
      />

      <View style={styles.infoBox}>
        <Ionicons name="cloud-done-outline" size={24} color={COLORS.accent} />
        <Text style={styles.infoText}>
          System status: <Text style={{ color: COLORS.accent, fontWeight: 'bold' }}>Online</Text>{'\n'}
          All changes sync immediately with the user app.
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
    // Subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  iconBox: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  textArea: { flex: 1 },
  cardTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '800', marginBottom: 4 },
  cardSub: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
  
  infoBox: { 
    flexDirection: 'row', 
    marginTop: 24, 
    padding: 20, 
    backgroundColor: 'rgba(187, 198, 51, 0.1)', // Low opacity accent
    borderRadius: 16, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(187, 198, 51, 0.2)'
  },
  infoText: { color: COLORS.textSecondary, fontSize: 13, marginLeft: 12, flex: 1, lineHeight: 19 },
});