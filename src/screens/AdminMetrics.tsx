// src/screens/AdminMetrics.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import DashboardHeader from '../components/DashboardHeader';
import { demoStore, PanicLog, User } from '../services/demoStore';
import { COLORS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

/* --- SUB-COMPONENTS --- */

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

const ViewSelector = ({ current, onChange }: { current: string, onChange: (v: 'alerts' | 'users') => void }) => (
  <View style={styles.selectorContainer}>
    <TouchableOpacity onPress={() => onChange('alerts')} style={[styles.selectorBtn, current === 'alerts' && styles.selectorActive]}>
      <Text style={[styles.selectorText, current === 'alerts' && { color: '#000' }]}>Recent Alerts</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => onChange('users')} style={[styles.selectorBtn, current === 'users' && styles.selectorActive]}>
      <Text style={[styles.selectorText, current === 'users' && { color: '#000' }]}>User Leaderboard</Text>
    </TouchableOpacity>
  </View>
);

const RecentLogItem = ({ item }: { item: PanicLog }) => {
  // Format: MM/DD/YYYY HH:mm (24h)
  const dateObj = new Date(item.timestamp);
  
  const mm = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const dd = dateObj.getDate().toString().padStart(2, '0');
  const yyyy = dateObj.getFullYear();
  
  const hh = dateObj.getHours().toString().padStart(2, '0');
  const min = dateObj.getMinutes().toString().padStart(2, '0');

  const formattedTime = `${mm}/${dd}/${yyyy} ${hh}:${min}`;

  return (
    <View style={styles.logRow}>
      <View style={styles.logIcon}>
        <Ionicons name="warning" size={16} color={COLORS.panic} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.logTop}>
          <Text style={styles.logName}>{item.userName}</Text>
          <Text style={styles.logTime}>{formattedTime}</Text>
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
  const [activeView, setActiveView] = useState<'alerts' | 'users'>('alerts');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    newSignups: number;
    activeUsers: number;
    topUsers: User[];
    recentLogs: PanicLog[];
  } | null>(null);
  
  // Local Search State for Logs
  const [logSearch, setLogSearch] = useState('');

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    const res = await demoStore.fetchMetrics(period);
    setData(res);
    setLoading(false);
  };

  // Filter Logs based on search
  const filteredLogs = data?.recentLogs.filter(l => 
    l.userName.toLowerCase().includes(logSearch.toLowerCase()) ||
    l.agent.toLowerCase().includes(logSearch.toLowerCase()) ||
    l.userPhone.includes(logSearch)
  ) || [];

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
          
          {/* High Level Stats */}
          <View style={styles.cardsRow}>
            <MetricCard label="New Signups" value={data.newSignups} color={COLORS.accent} />
            <View style={{ width: 12 }} />
            <MetricCard label="Active Users" value={data.activeUsers} color="#4A90E2" />
          </View>

          {/* Toggle View */}
          <ViewSelector current={activeView} onChange={setActiveView} />

          {/* Dynamic Content Area */}
          <View style={styles.cardContainer}>
            
            {activeView === 'alerts' ? (
              <>
                {/* Search Bar for Alerts */}
                <View style={styles.searchBar}>
                  <Ionicons name="search" size={18} color={COLORS.textSecondary} />
                  <TextInput 
                    style={styles.searchInput} 
                    placeholder="Search alerts..." 
                    placeholderTextColor={COLORS.textSecondary}
                    value={logSearch}
                    onChangeText={setLogSearch}
                  />
                </View>

                {/* Scrollable List of Logs */}
                <ScrollView style={{ maxHeight: 400 }} nestedScrollEnabled>
                  {filteredLogs.length === 0 ? (
                    <Text style={styles.emptyText}>No alerts found.</Text>
                  ) : (
                    filteredLogs.map((log) => (
                      <RecentLogItem key={log.id} item={log} />
                    ))
                  )}
                </ScrollView>
              </>
            ) : (
              /* User Leaderboard View */
              <ScrollView style={{ maxHeight: 400 }} nestedScrollEnabled>
                 {data.topUsers.length === 0 ? (
                   <Text style={styles.emptyText}>No active users in this period.</Text>
                 ) : (
                   data.topUsers.map((u, i) => (
                     <TopUserRow key={u.id} user={u} rank={i + 1} />
                   ))
                 )}
              </ScrollView>
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

  /* View Selector */
  selectorContainer: { flexDirection: 'row', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#2A3028' },
  selectorBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  selectorActive: { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  selectorText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: 14 },

  /* Main Card Container */
  cardContainer: { backgroundColor: '#141812', borderRadius: 16, padding: 4, overflow: 'hidden', minHeight: 200 },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', padding: 20, fontStyle: 'italic', marginTop: 20 },

  /* Search Bar */
  searchBar: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 8, paddingHorizontal: 12, margin: 8, height: 40 
  },
  searchInput: { flex: 1, marginLeft: 8, color: COLORS.textPrimary, fontSize: 14 },

  /* Log Item */
  logRow: { flexDirection: 'row', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', alignItems: 'flex-start' },
  logIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(214, 69, 69, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },
  logTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  logName: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 15 },
  logTime: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
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