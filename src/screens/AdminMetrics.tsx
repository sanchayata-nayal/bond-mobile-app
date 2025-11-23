// src/screens/AdminMetrics.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import DashboardHeader from '../components/DashboardHeader';
import { demoStore } from '../services/demoStore';
import { COLORS } from '../styles/theme';

export default function AdminMetrics({ navigation }: any) {
  const [period, setPeriod] = useState<'7d'|'30d'|'all'>('7d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData(period);
  }, [period]);

  const loadData = async (p: any) => {
    setLoading(true);
    const res = await demoStore.fetchMetrics(p);
    setData(res);
    setLoading(false);
  };

  const FilterTab = ({ label, val }: any) => (
    <TouchableOpacity 
      onPress={() => setPeriod(val)}
      style={[styles.tab, period === val && styles.tabActive]}
    >
      <Text style={[styles.tabText, period === val && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const StatCard = ({ label, value, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <ScreenContainer scrollable>
      <DashboardHeader title="App Usage Metrics" showBack onBackPress={() => navigation.goBack()} userInitial="A" />

      <View style={styles.filterRow}>
        <FilterTab label="7 Days" val="7d" />
        <FilterTab label="30 Days" val="30d" />
        <FilterTab label="All Time" val="all" />
      </View>

      {loading ? (
        <View style={{ height: 200, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : (
        <>
          <View style={styles.statsRow}>
            <StatCard label="New Signups" value={data.newSignups} color={COLORS.accent} />
            <View style={{ width: 12 }} />
            <StatCard label="Active Users" value={data.activeUsers} color={COLORS.panic} />
          </View>

          <Text style={styles.sectionHeader}>Top Active Users (Panic Triggers)</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.col, { flex: 2 }]}>User</Text>
              <Text style={styles.col}>Agent</Text>
              <Text style={[styles.col, { textAlign: 'right' }]}>Alerts</Text>
            </View>
            
            {data.topUsers.map((u: any, i: number) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.col, { flex: 2, color: COLORS.textPrimary }]}>{u.firstName} {u.lastName}</Text>
                <Text style={styles.col}>{u.agent}</Text>
                <Text style={[styles.col, { textAlign: 'right', fontWeight: 'bold', color: COLORS.panic }]}>{u.panicCount}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', backgroundColor: '#141812', borderRadius: 12, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#2A3028' },
  tabText: { color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: COLORS.textPrimary },

  statsRow: { flexDirection: 'row', marginBottom: 32 },
  statCard: { flex: 1, backgroundColor: '#141812', padding: 20, borderRadius: 16, borderLeftWidth: 4 },
  statValue: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '900', marginBottom: 4 },
  statLabel: { color: COLORS.textSecondary, fontSize: 13 },

  sectionHeader: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  
  table: { backgroundColor: '#141812', borderRadius: 16, padding: 8 },
  tableRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  tableHeader: { borderBottomWidth: 1, borderBottomColor: '#2A3028', marginBottom: 4 },
  col: { flex: 1, color: COLORS.textSecondary, fontSize: 13 },
});