// src/screens/AdminRecipients.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import DashboardHeader from '../components/DashboardHeader';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import PhoneInput from '../components/PhoneInput';
import { demoStore } from '../services/demoStore';
import { COLORS, LAYOUT } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AdminRecipients({ navigation }: any) {
  const [primary, setPrimary] = useState('');
  const [recipients, setRecipients] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Form State for New Recipient
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Load Initial Data
  useEffect(() => {
    const data = demoStore.getRecipients();
    setPrimary(data.primary.replace('+1', '')); // Strip +1 for display if US
    setRecipients(data.list);
  }, []);

  const handleSavePrimary = () => {
    // In a real app, validate format first
    demoStore.updatePrimaryNumber(`+1${primary}`);
    Alert.alert('Success', 'Primary emergency call number updated.');
  };

  const handleAddRecipient = () => {
    if (!newName || !newPhone) {
      Alert.alert('Missing Data', 'Please enter both name and phone.');
      return;
    }
    demoStore.addRecipient(newName, `+1${newPhone}`);
    setRecipients(demoStore.getRecipients().list); // Refresh list
    setNewName('');
    setNewPhone('');
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Recipient', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Remove', 
        style: 'destructive', 
        onPress: () => {
          demoStore.removeRecipient(id);
          setRecipients(demoStore.getRecipients().list);
        } 
      }
    ]);
  };

  return (
    <ScreenContainer scrollable>
      <DashboardHeader title="Routing Config" showBack onBackPress={() => navigation.goBack()} userInitial="A" />

      {/* --- SECTION 1: PRIMARY CALL --- */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="call" size={20} color={COLORS.accent} />
          <Text style={styles.sectionTitle}>Primary Emergency Call</Text>
        </View>
        <Text style={styles.sectionDesc}>
          This single number will be dialed automatically when the user presses "Call Agent".
        </Text>

        <View style={styles.primaryRow}>
          <View style={{ flex: 1 }}>
            <PhoneInput 
              value={primary} 
              onChange={setPrimary} 
              countryCode="+1"
              placeholder="Primary Agent Number"
            />
          </View>
          <TouchableOpacity onPress={handleSavePrimary} style={styles.saveBtn}>
            <Ionicons name="checkmark" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- SECTION 2: SMS BROADCAST --- */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="chatbubbles" size={20} color={COLORS.accent} />
          <Text style={styles.sectionTitle}>SMS Broadcast List</Text>
        </View>
        <Text style={styles.sectionDesc}>
          The panic alert SMS will be sent to all recipients below simultaneously.
        </Text>

        {/* List */}
        {recipients.map((r, index) => (
          <View key={r.id} style={styles.card}>
            <View style={styles.cardBadge}>
              <Text style={styles.badgeText}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{r.name}</Text>
              <Text style={styles.cardPhone}>{r.phone}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(r.id)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Add Button */}
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#000" />
          <Text style={styles.addBtnText}>Add New Recipient</Text>
        </TouchableOpacity>
      </View>

      {/* --- ADD RECIPIENT MODAL --- */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Recipient</Text>
            <Text style={styles.modalSub}>Add a contact to the SOS broadcast.</Text>
            
            <AppInput 
              label="Agent / Desk Name" 
              placeholder="e.g. Central Dispatch" 
              value={newName} 
              onChangeText={setNewName} 
              autoFocus
            />
            
            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: COLORS.textSecondary, marginBottom: 8, fontSize: 13 }}>Phone Number</Text>
              <PhoneInput 
                value={newPhone} 
                onChange={setNewPhone} 
                countryCode="+1" 
                placeholder="561..." 
              />
            </View>

            <View style={styles.modalActions}>
              <AppButton title="Cancel" onPress={() => setModalVisible(false)} variant="ghost" style={{ flex: 1, marginRight: 8 }} />
              <AppButton title="Add" onPress={handleAddRecipient} style={{ flex: 1, marginLeft: 8 }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionContainer: { marginBottom: 32, width: '100%' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800', marginLeft: 10 },
  sectionDesc: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 16 },
  
  primaryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  saveBtn: { 
    height: LAYOUT.controlHeight, width: LAYOUT.controlHeight, 
    backgroundColor: COLORS.accent, borderRadius: 12, 
    alignItems: 'center', justifyContent: 'center', 
    marginTop: 24 // Align with input visual
  },
  
  /* List Card */
  card: { 
    flexDirection: 'row', alignItems: 'center', padding: 14, 
    backgroundColor: '#141812', borderRadius: 12, marginBottom: 10,
    borderWidth: 1, borderColor: '#2A3028'
  },
  cardBadge: { 
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#2A3028', 
    alignItems: 'center', justifyContent: 'center', marginRight: 12 
  },
  badgeText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: 'bold' },
  cardName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  cardPhone: { color: COLORS.accent, fontSize: 13 },
  deleteBtn: { padding: 8 },

  /* Add Button */
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.accent, height: 48, borderRadius: 12, marginTop: 8
  },
  addBtnText: { color: '#000', fontWeight: '700', fontSize: 15, marginLeft: 8 },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { 
    backgroundColor: '#141812', padding: 24, borderRadius: 20, width: '100%', maxWidth: 420, 
    borderWidth: 1, borderColor: '#2A3028'
  },
  modalTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  modalSub: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 20 },
  modalActions: { flexDirection: 'row', marginTop: 12 },
});