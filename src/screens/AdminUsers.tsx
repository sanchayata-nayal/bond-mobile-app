// src/screens/AdminUsers.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import DashboardHeader from '../components/DashboardHeader';
import AppInput from '../components/AppInput';
import { demoStore, User } from '../services/demoStore';
import { COLORS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AdminUsers({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>(demoStore.getAllUsers());

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete User', `Permanently delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: () => {
          demoStore.deleteUser(id);
          setUsers(demoStore.getAllUsers()); // Refresh
        }
      }
    ]);
  };

  const filtered = users.filter(u => 
    u.firstName.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.firstName[0]}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.detail}>{item.email}</Text>
        <Text style={styles.detail}>{item.phone} • Agent: {item.agent}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id, item.firstName)} style={styles.delBtn}>
        <Ionicons name="trash-bin-outline" size={20} color={COLORS.panic} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer scrollable={false}>
      <DashboardHeader title="User Management" showBack onBackPress={() => navigation.goBack()} userInitial="A" />

      <View style={{ width: '100%', marginBottom: 10 }}>
        <AppInput 
          placeholder="Search users..." 
          icon="search" 
          value={search} 
          onChangeText={setSearch} 
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={{ width: '100%' }}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={<Text style={styles.empty}>No users found.</Text>}
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
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#2A3028',
    alignItems: 'center', justifyContent: 'center', marginRight: 12
  },
  avatarText: { color: COLORS.textPrimary, fontWeight: 'bold', fontSize: 18 },
  info: { flex: 1 },
  name: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  detail: { color: COLORS.textSecondary, fontSize: 12 },
  delBtn: { padding: 8 },
  empty: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 },
});