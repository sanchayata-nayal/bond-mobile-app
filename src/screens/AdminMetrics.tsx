// src/screens/AdminMetrics.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import DashboardHeader from '../components/DashboardHeader';
import { demoStore, PanicLog, User } from '../services/demoStore';
import { COLORS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

/* --- SUB-COMPONENTS for Modularity --- */

const SectionHeader = ({ title, icon }: { title: string, icon: any }) => (
  <View style={styles.sectionHeader}>
    <Ionicons name={icon} size={18} color={COLORS.accent} style={{ marginRight: 8 }} />
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const MetricCard = ({ label, value, color }: { label: string, value: string | number, color: string }) => (
  <View style={[styles.metricCard, { borderLeftColor: color }]}>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const FilterTabs = ({ current, onChange }: { current: string, onChange: (v: any) => void }) => (
  <View style={styles.filterContainer}>
    {['7d', '30d', 'all'].map((key) => (
      <TouchableOpacity 
        key={key} 
        onPress={() => onChange(key)}
        style={[styles.tab, current === key && styles.tabActive]}
      >
        <Text style={[styles.tabText, current === key && styles.tabTextActive]}>
          {key === '7d' ? '7 Days' : key === '30d' ? '30 Days' : 'All Time'}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const RecentLogItem = ({ item }: { item: PanicLog }) => {
  const date = new Date(item.timestamp);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString();

  return (
    <View style={styles.logRow}>
      <View style={styles.logIcon}>
        <Ionicons name="warning" size={16} color={COLORS.panic} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.logTop}>
          <Text style={styles.logName}>{item.userName}</Text>
          <Text style={styles.logTime}>{dateStr} • {timeStr}</Text>
        </View>
        <Text style={styles.logDetail}>Agent: {item.agent}</Text>
        <Text style={styles.logDetail}>{item.userPhone}</Text>
      </View>
    </View>
  );
};

const TopUserRow = ({ user, rank }: { user: User, rank: number }) => (
  <View style={styles.userRow}>
    <View style={styles.rankBadge}>
      <Text style={styles.rankText}>#{rank}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.userRowName}>{user.firstName} {user.lastName}</Text>
      <Text style={styles.userRowAgent}>{user.agent}</Text>
    </View>
    <View style={styles.countBadge}>
      <Text style={styles.countText}>{user.panicCount}</Text>
      <Text style={styles.countLabel}>Alerts</Text>
    </View>
  </View>
);

/* --- MAIN SCREEN --- */

export default function AdminMetrics({ navigation }: any) {
  const [period, setPeriod] = useState<'7d'|'30d'|'all'>('7d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    newSignups: number;
    activeUsers: number;
    topUsers: User[];
    recentLogs: PanicLog[];
  } | null>(null);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    const res = await demoStore.fetchMetrics(period);
    setData(res);
    setLoading(false);
  };

  return (
    <ScreenContainer scrollable>
      <DashboardHeader title="Analytics" showBack onBackPress={() => navigation.goBack()} userInitial="A" />

      <FilterTabs current={period} onChange={setPeriod} />

      {loading || !data ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : (
        <View style={{ width: '100%' }}>
          
          {/* 1. High Level Stats */}
          <View style={styles.cardsRow}>
            <MetricCard label="New Signups" value={data.newSignups} color={COLORS.accent} />
            <View style={{ width: 12 }} />
            <MetricCard label="Active Users" value={data.activeUsers} color="#4A90E2" />
          </View>

          {/* 2. Recent Panic Activity (The requested Table) */}
          <SectionHeader title="Recent Panic Alerts" icon="list" />
          <View style={styles.cardContainer}>
            {data.recentLogs.length === 0 ? (
              <Text style={styles.emptyText}>No alerts in this period.</Text>
            ) : (
              data.recentLogs.map((log) => (
                <RecentLogItem key={log.id} item={log} />
              ))
            )}
          </View>

          {/* 3. Top Active Users (Leaderboard) */}
          <SectionHeader title="Top Active Users" icon="trophy-outline" />
          <View style={styles.cardContainer}>
             {data.topUsers.length === 0 ? (
               <Text style={styles.emptyText}>No active users.</Text>
             ) : (
               data.topUsers.map((u, i) => (
                 <TopUserRow key={u.id} user={u} rank={i + 1} />
               ))
             )}
          </View>

          <View style={{ height: 40 }} />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loader: { height: 200, justifyContent: 'center' },
  
  /* Filter Tabs */
  filterContainer: { flexDirection: 'row', backgroundColor: '#141812', borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#2A3028' },
  tabText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: COLORS.textPrimary },

  /* Metric Cards */
  cardsRow: { flexDirection: 'row', marginBottom: 24 },
  metricCard: { flex: 1, backgroundColor: '#141812', padding: 16, borderRadius: 16, borderLeftWidth: 4 },
  metricValue: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '900', marginBottom: 4 },
  metricLabel: { color: COLORS.textSecondary, fontSize: 12 },

  /* Sections */
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 8, paddingLeft: 4 },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  
  cardContainer: { backgroundColor: '#141812', borderRadius: 16, padding: 4, overflow: 'hidden', marginBottom: 16 },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', padding: 20, fontStyle: 'italic' },

  /* Log Item */
  logRow: { flexDirection: 'row', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', alignItems: 'flex-start' },
  logIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(214, 69, 69, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },
  logTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  logName: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 15 },
  logTime: { color: COLORS.textSecondary, fontSize: 12 },
  logDetail: { color: COLORS.textSecondary, fontSize: 12.5, lineHeight: 18 },

  /* User Row */
  userRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  rankBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#2A3028', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rankText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: 'bold' },
  userRowName: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 15 },
  userRowAgent: { color: COLORS.textSecondary, fontSize: 12 },
  countBadge: { alignItems: 'center', paddingHorizontal: 8 },
  countText: { color: COLORS.panic, fontWeight: '900', fontSize: 16 },
  countLabel: { color: COLORS.textSecondary, fontSize: 10 },
});