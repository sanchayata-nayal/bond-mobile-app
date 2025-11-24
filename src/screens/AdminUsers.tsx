// src/screens/AdminUsers.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import DashboardHeader from '../components/DashboardHeader';
import AppInput from '../components/AppInput';
import ConfirmationModal from '../components/ConfirmationModal';
import { demoStore, User } from '../services/demoStore';
import { COLORS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

export default function AdminUsers({ navigation }: any) {
  const isFocused = useIsFocused();
  const [search, setSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('All');
  const [users, setUsers] = useState<User[]>([]);
  
  // Delete State
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{id: string, name: string} | null>(null);

  // Refresh data when screen focuses (in case edits were made in UserDetails)
  useEffect(() => {
    if (isFocused) {
      setUsers(demoStore.getAllUsers());
    }
  }, [isFocused]);

  // Get unique agents for filter
  const agents = useMemo(() => {
    const allAgents = users.map(u => u.agent || 'Unknown');
    return ['All', ...Array.from(new Set(allAgents))];
  }, [users]);

  // Filter Logic
  const filtered = users.filter(u => {
    const matchesSearch = 
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search);
    
    const matchesAgent = selectedAgent === 'All' || u.agent === selectedAgent;

    return matchesSearch && matchesAgent;
  });

  const confirmDelete = () => {
    if (userToDelete) {
      demoStore.deleteUser(userToDelete.id);
      setUsers(demoStore.getAllUsers());
    }
    setDeleteModalVisible(false);
    setUserToDelete(null);
  };

  const promptDelete = (u: User) => {
    setUserToDelete({ id: u.id, name: `${u.firstName} ${u.lastName}` });
    setDeleteModalVisible(true);
  };

  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('UserDetails', { user: item })} // Pass user param
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.firstName[0]}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.detail}>{item.email || 'No Email'}</Text>
        <Text style={styles.detail}>{item.phone} • {item.agent}</Text>
      </View>
      <TouchableOpacity onPress={() => promptDelete(item)} style={styles.delBtn}>
        <Ionicons name="trash-outline" size={20} color={COLORS.panic} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer scrollable={false}>
      <DashboardHeader title="User Management" showBack onBackPress={() => navigation.goBack()} userInitial="A" />

      {/* Search */}
      <View style={{ width: '100%', marginBottom: 12 }}>
        <AppInput 
          placeholder="Search name, email, phone..." 
          icon="search" 
          value={search} 
          onChangeText={setSearch} 
        />
      </View>

      {/* Agent Filter */}
      <View style={{ height: 44, marginBottom: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
          {agents.map((agent) => (
            <TouchableOpacity
              key={agent}
              onPress={() => setSelectedAgent(agent)}
              style={[styles.chip, selectedAgent === agent && styles.chipActive]}
            >
              <Text style={[styles.chipText, selectedAgent === agent && styles.chipTextActive]}>{agent}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Count */}
      <Text style={styles.countText}>Showing {filtered.length} Users</Text>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={{ width: '100%' }}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={<Text style={styles.empty}>No users found matching criteria.</Text>}
      />

      {/* Delete Modal */}
      <ConfirmationModal
        visible={deleteModalVisible}
        title="Delete User"
        message={`Are you sure you want to permanently delete ${userToDelete?.name}?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        confirmText="Delete"
        variant="danger"
        icon="trash-outline"
      />

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#141812', padding: 16, borderRadius: 14,
    marginBottom: 12, borderWidth: 1, borderColor: '#2A3028'
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#2A3028',
    alignItems: 'center', justifyContent: 'center', marginRight: 14
  },
  avatarText: { color: COLORS.textPrimary, fontWeight: 'bold', fontSize: 18 },
  info: { flex: 1 },
  name: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  detail: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 1 },
  delBtn: { padding: 10 },
  empty: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 },
  
  /* Chips */
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#1A2018', borderWidth: 1, borderColor: '#2A3028',
    marginRight: 8, height: 32, justifyContent: 'center'
  },
  chipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  chipText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#0F150D' },

  countText: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 12, width: '100%', textAlign: 'right' },
});