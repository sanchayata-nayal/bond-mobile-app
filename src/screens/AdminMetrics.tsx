// src/screens/AdminMetrics.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, TextInput, Platform } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import DashboardHeader from '../components/DashboardHeader';
import { demoStore, PanicLog, User } from '../services/demoStore';
import { COLORS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

/* --- HELPERS --- */
const formatDate = (isoString: string) => {
  const d = new Date(isoString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');

  // Format: Feb 24, 2025 • 14:30
  return `${month} ${day}, ${year} • ${hours}:${mins}`;
};

/* --- SUB-COMPONENTS --- */

const MetricCard = ({ label, value, icon, color }: { label: string, value: string | number, icon: any, color: string }) => (
  <View style={styles.metricCard}>
    <View style={[styles.metricIconWrap, { backgroundColor: color }]}>
      <Ionicons name={icon} size={20} color="#000" />
    </View>
    <View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
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
    <TouchableOpacity 
      onPress={() => onChange('alerts')} 
      style={[styles.selectorBtn, current === 'alerts' && styles.selectorActive]}
    >
      <Text style={[styles.selectorText, current === 'alerts' && styles.selectorTextActive]}>Recent Alerts</Text>
    </TouchableOpacity>
    <TouchableOpacity 
      onPress={() => onChange('users')} 
      style={[styles.selectorBtn, current === 'users' && styles.selectorActive]}
    >
      <Text style={[styles.selectorText, current === 'users' && styles.selectorTextActive]}>Top Active Users</Text>
    </TouchableOpacity>
  </View>
);

const RecentLogItem = ({ item }: { item: PanicLog }) => (
  <View style={styles.logRow}>
    <View style={styles.logIcon}>
      <Ionicons name="warning" size={18} color={COLORS.panic} />
    </View>
    <View style={{ flex: 1 }}>
      <View style={styles.logTop}>
        <Text style={styles.logName}>{item.userName}</Text>
        <Text style={styles.logTime}>{formatDate(item.timestamp)}</Text>
      </View>
      <Text style={styles.logDetail}>Agent: {item.agent}</Text>
      <Text style={styles.logDetail}>{item.userPhone}</Text>
    </View>
  </View>
);

const TopUserRow = ({ user, rank }: { user: User, rank: number }) => (
  <View style={styles.userRow}>
    <View style={styles.rankBadge}>
      <Text style={styles.rankText}>{rank}</Text>
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

  // Filter Logs
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
          
          {/* Elegant Metric Cards */}
          <View style={styles.cardsRow}>
            <MetricCard 
              label="New Signups" 
              value={data.newSignups} 
              icon="person-add-outline" 
              color={COLORS.accent} 
            />
            <View style={{ width: 12 }} />
            <MetricCard 
              label="Active Users" 
              value={data.activeUsers} 
              icon="pulse-outline" 
              color="#4A90E2" 
            />
          </View>

          <View style={{ height: 12 }} />

          {/* View Switcher */}
          <ViewSelector current={activeView} onChange={setActiveView} />

          {/* Content Area */}
          <View style={styles.cardContainer}>
            
            {activeView === 'alerts' ? (
              <>
                {/* Search Bar */}
                <View style={styles.searchBar}>
                  <Ionicons name="search" size={16} color={COLORS.textSecondary} />
                  <TextInput 
                    style={styles.searchInput} 
                    placeholder="Search logs..." 
                    placeholderTextColor={COLORS.textSecondary}
                    value={logSearch}
                    onChangeText={setLogSearch}
                  />
                </View>

                <ScrollView style={{ maxHeight: 450 }} nestedScrollEnabled showsVerticalScrollIndicator={true}>
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
              /* Top Users View */
              <ScrollView style={{ maxHeight: 450 }} nestedScrollEnabled showsVerticalScrollIndicator={true}>
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
  filterContainer: { flexDirection: 'row', backgroundColor: '#141812', borderRadius: 12, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: '#2A3028' },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#2A3028' },
  tabText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: COLORS.textPrimary },

  /* Elegant Metric Cards */
  cardsRow: { flexDirection: 'row', marginBottom: 16 },
  metricCard: { 
    flex: 1, 
    backgroundColor: '#141812', 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#2A3028',
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(0,0,0,0.2)' } as any,
      default: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 }
    })
  },
  metricIconWrap: { 
    width: 40, height: 40, borderRadius: 20, 
    alignItems: 'center', justifyContent: 'center', marginRight: 12 
  },
  metricValue: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800', marginBottom: 2 },
  metricLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },

  /* View Selector (Segmented Control style) */
  selectorContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#141812', 
    borderRadius: 12, 
    padding: 4, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A3028'
  },
  selectorBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  selectorActive: { backgroundColor: COLORS.accent },
  selectorText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: 13 },
  selectorTextActive: { color: '#0F150D' }, // Black text on active Lime background

  /* Main Content */
  cardContainer: { backgroundColor: '#141812', borderRadius: 16, padding: 4, overflow: 'hidden', minHeight: 200, borderWidth: 1, borderColor: '#2A3028' },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', padding: 20, fontStyle: 'italic', marginTop: 20 },

  /* Search Bar */
  searchBar: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 10, paddingHorizontal: 12, margin: 10, height: 42, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  searchInput: { flex: 1, marginLeft: 10, color: COLORS.textPrimary, fontSize: 14 },

  /* Log Item */
  logRow: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', alignItems: 'flex-start' },
  logIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(214, 69, 69, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 14, marginTop: 2 },
  logTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  logName: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 15 },
  logTime: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' },
  logDetail: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 },

  /* User Row */
  userRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  rankBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#2A3028', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  rankText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: 'bold' },
  userRowName: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 15 },
  userRowAgent: { color: COLORS.textSecondary, fontSize: 13 },
  countBadge: { alignItems: 'center', paddingHorizontal: 10, backgroundColor: 'rgba(214, 69, 69, 0.1)', borderRadius: 8, paddingVertical: 4 },
  countText: { color: COLORS.panic, fontWeight: '800', fontSize: 15 },
  countLabel: { color: COLORS.panic, fontSize: 10, opacity: 0.8 },
});