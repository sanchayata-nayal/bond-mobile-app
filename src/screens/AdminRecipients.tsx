// src/screens/AdminRecipients.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import DashboardHeader from '../components/DashboardHeader';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import { demoStore } from '../services/demoStore';
import { COLORS, LAYOUT } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AdminRecipients({ navigation }: any) {
  const data = demoStore.getRecipients();
  const [primary, setPrimary] = useState(data.primary);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [recipients, setRecipients] = useState(data.list);

  const handleSavePrimary = () => {
    demoStore.updatePrimaryNumber(primary);
    Alert.alert('Success', 'Primary agent number updated.');
  };

  const handleAdd = () => {
    if (!newName || !newPhone) return;
    demoStore.addRecipient(newName, newPhone);
    setRecipients(demoStore.getRecipients().list); // Refresh
    setNewName('');
    setNewPhone('');
  };

  const handleDelete = (id: string) => {
    demoStore.removeRecipient(id);
    setRecipients(demoStore.getRecipients().list);
  };

  return (
    <ScreenContainer scrollable>
      <DashboardHeader title="Recipients" showBack onBackPress={() => navigation.goBack()} userInitial="A" />

      {/* Primary Number Section */}
      <View style={styles.section}>
        <Text style={styles.heading}>Primary Call Number</Text>
        <Text style={styles.sub}>This number is dialed when users panic.</Text>
        
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <AppInput 
              value={primary} 
              onChangeText={setPrimary} 
              keyboardType="phone-pad" 
              icon="call"
            />
          </View>
          <TouchableOpacity onPress={handleSavePrimary} style={styles.saveBtn}>
            <Ionicons name="save-outline" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* SMS List Section */}
      <View style={styles.section}>
        <Text style={styles.heading}>SMS Notification List</Text>
        <Text style={styles.sub}>These contacts receive the SOS text message.</Text>

        {recipients.map((r) => (
          <View key={r.id} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{r.name}</Text>
              <Text style={styles.itemPhone}>{r.phone}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(r.id)} style={styles.delBtn}>
              <Ionicons name="trash-outline" size={18} color={COLORS.panic} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Add New */}
        <View style={styles.addBox}>
          <Text style={styles.addTitle}>Add New Recipient</Text>
          <AppInput placeholder="Name (e.g. Dispatch)" value={newName} onChangeText={setNewName} />
          <AppInput placeholder="Phone (+1...)" value={newPhone} onChangeText={setNewPhone} keyboardType="phone-pad" />
          <AppButton title="Add Recipient" onPress={handleAdd} disabled={!newName || !newPhone} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 32, width: '100%' },
  heading: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  sub: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  saveBtn: { 
    height: LAYOUT.controlHeight, width: LAYOUT.controlHeight, 
    backgroundColor: COLORS.accent, borderRadius: 12, 
    alignItems: 'center', justifyContent: 'center', marginBottom: 14 
  },
  itemRow: { 
    flexDirection: 'row', alignItems: 'center', padding: 16, 
    backgroundColor: '#141812', borderRadius: 12, marginBottom: 10,
    borderWidth: 1, borderColor: '#2A3028'
  },
  itemName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  itemPhone: { color: COLORS.textSecondary, fontSize: 13 },
  delBtn: { padding: 8 },
  addBox: { marginTop: 10, padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16 },
  addTitle: { color: COLORS.accent, fontSize: 14, fontWeight: '700', marginBottom: 12 },
});