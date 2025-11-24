// src/screens/AdminRecipients.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import DashboardHeader from '../components/DashboardHeader';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import PhoneInput from '../components/PhoneInput';
import ConfirmationModal from '../components/ConfirmationModal'; // Reused custom modal
import { demoStore } from '../services/demoStore';
import { COLORS, LAYOUT } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AdminRecipients({ navigation }: any) {
  const [primary, setPrimary] = useState('');
  const [recipients, setRecipients] = useState<any[]>([]);
  
  // Modal States
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  
  // Dropdown State
  const [showPrimaryDropdown, setShowPrimaryDropdown] = useState(false);

  // Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Load Initial Data
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const data = demoStore.getRecipients();
    setPrimary(data.primary);
    setRecipients(data.list);
  };

  const handleSetPrimary = (phone: string) => {
    demoStore.updatePrimaryNumber(phone);
    setPrimary(phone);
    setShowPrimaryDropdown(false);
  };

  const handleAddRecipient = () => {
    if (!newName || !newPhone) {
      // Minimal alert for empty fields is fine, or use custom if preferred
      Alert.alert('Missing Data', 'Please enter both name and phone.');
      return;
    }
    // Store formatted with +1 for simplicity in this demo
    demoStore.addRecipient(newName, `+1${newPhone}`);
    refreshData();
    setNewName('');
    setNewPhone('');
    setAddModalVisible(false);
  };

  const confirmDelete = () => {
    if (selectedDeleteId) {
      demoStore.removeRecipient(selectedDeleteId);
      
      // If we deleted the primary number, reset primary to empty or first available
      const updatedList = demoStore.getRecipients().list;
      if (updatedList.length > 0 && !updatedList.find(r => r.phone === primary)) {
        const newPrime = updatedList[0].phone;
        demoStore.updatePrimaryNumber(newPrime);
        setPrimary(newPrime);
      } else if (updatedList.length === 0) {
        demoStore.updatePrimaryNumber('');
        setPrimary('');
      }

      refreshData();
    }
    setDeleteModalVisible(false);
    setSelectedDeleteId(null);
  };

  const openDeleteModal = (id: string) => {
    setSelectedDeleteId(id);
    setDeleteModalVisible(true);
  };

  // Helper to find name of primary number
  const primaryName = recipients.find(r => r.phone === primary)?.name || 'Select Recipient';

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
          Select one contact from the list below to receive the direct emergency phone call.
        </Text>

        {/* Custom Dropdown Trigger */}
        <TouchableOpacity 
          style={styles.dropdownTrigger} 
          onPress={() => setShowPrimaryDropdown(!showPrimaryDropdown)}
          activeOpacity={0.8}
        >
          <View>
            <Text style={styles.dropdownLabel}>Selected Agent</Text>
            <Text style={styles.dropdownValue}>{primaryName}</Text>
            {primary ? <Text style={styles.dropdownSub}>{primary}</Text> : null}
          </View>
          <Ionicons name={showPrimaryDropdown ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* Dropdown Body */}
        {showPrimaryDropdown && (
          <View style={styles.dropdownBody}>
            {recipients.length === 0 && <Text style={styles.emptyText}>No recipients added yet.</Text>}
            {recipients.map((r) => (
              <TouchableOpacity 
                key={r.id} 
                style={[styles.dropdownItem, primary === r.phone && styles.dropdownItemActive]} 
                onPress={() => handleSetPrimary(r.phone)}
              >
                <Text style={[styles.dropdownItemName, primary === r.phone && { color: COLORS.background }]}>{r.name}</Text>
                <Text style={[styles.dropdownItemPhone, primary === r.phone && { color: COLORS.background }]}>{r.phone}</Text>
                {primary === r.phone && <Ionicons name="checkmark-circle" size={18} color={COLORS.background} style={{position: 'absolute', right: 12}} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
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
            <TouchableOpacity onPress={() => openDeleteModal(r.id)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)}>
          <Ionicons name="add" size={24} color="#000" />
          <Text style={styles.addBtnText}>Add New Recipient</Text>
        </TouchableOpacity>
      </View>

      {/* --- MODALS --- */}
      
      {/* Add Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide">
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
              <AppButton title="Cancel" onPress={() => setAddModalVisible(false)} variant="ghost" style={{ flex: 1, marginRight: 8 }} />
              <AppButton title="Add" onPress={handleAddRecipient} style={{ flex: 1, marginLeft: 8 }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={deleteModalVisible}
        title="Remove Recipient"
        message="Are you sure you want to remove this contact from the broadcast list?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        confirmText="Remove"
        variant="danger"
        icon="trash-outline"
      />

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionContainer: { marginBottom: 32, width: '100%' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800', marginLeft: 10 },
  sectionDesc: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 16 },
  
  /* Dropdown Style */
  dropdownTrigger: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#141812', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: COLORS.accent,
  },
  dropdownLabel: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 4 },
  dropdownValue: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  dropdownSub: { color: COLORS.accent, fontSize: 13, marginTop: 2 },
  
  dropdownBody: {
    marginTop: 8, backgroundColor: '#141812', borderRadius: 12,
    borderWidth: 1, borderColor: '#2A3028', overflow: 'hidden'
  },
  dropdownItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#2A3028', justifyContent: 'center' },
  dropdownItemActive: { backgroundColor: COLORS.accent },
  dropdownItemName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  dropdownItemPhone: { color: COLORS.textSecondary, fontSize: 13 },
  emptyText: { color: COLORS.textSecondary, padding: 16, textAlign: 'center' },

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
  cardPhone: { color: COLORS.textSecondary, fontSize: 13 },
  deleteBtn: { padding: 8 },

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