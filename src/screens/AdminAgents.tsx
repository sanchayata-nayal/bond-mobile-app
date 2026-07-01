import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import DashboardHeader from '../components/DashboardHeader';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import AgentSelect from '../components/AgentSelect';
import ConfirmationModal from '../components/ConfirmationModal';
import { Agent, demoStore, User } from '../services/demoStore';
import { COLORS } from '../styles/theme';

export default function AdminAgents({ navigation }: any) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [requests, setRequests] = useState<User[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<User | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

  const refreshData = () => {
    const nextAgents = demoStore.getAgents();
    setAgents(nextAgents);
    setRequests(demoStore.getPendingAgentRequests());
    setSelectedAgent((current) => current || nextAgents[0]?.name || '');
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleAddAgent = () => {
    const agent = demoStore.addAgent(newAgentName);
    if (!agent) {
      Alert.alert('Missing Agent', 'Please enter an agent name.');
      return;
    }

    setNewAgentName('');
    setAddModalVisible(false);
    refreshData();
  };

  const openMapModal = (user: User) => {
    setSelectedRequest(user);
    setSelectedAgent(agents[0]?.name || '');
    setMapModalVisible(true);
  };

  const handleMapRequest = () => {
    if (!selectedRequest || !selectedAgent) return;
    demoStore.assignAgentToUser(selectedRequest.id, selectedAgent);
    setMapModalVisible(false);
    setSelectedRequest(null);
    refreshData();
  };

  const handleAddAndAssign = (user: User) => {
    const requestedName = user.requestedAgentName?.trim();
    if (!requestedName) return;

    const agent = demoStore.addAgent(requestedName);
    demoStore.assignAgentToUser(user.id, agent?.name || requestedName);
    refreshData();
  };

  const openDeleteModal = (agent: Agent) => {
    setAgentToDelete(agent);
    setDeleteModalVisible(true);
  };

  const handleDeleteAgent = () => {
    if (agentToDelete) {
      demoStore.removeAgent(agentToDelete.id);
      refreshData();
    }
    setAgentToDelete(null);
    setDeleteModalVisible(false);
  };

  return (
    <ScreenContainer scrollable>
      <DashboardHeader
        title="Agent Management"
        showBack
        onBackPress={() => navigation.goBack()}
        userInitial="A"
      />

      <View style={styles.sectionHeaderRow}>
        <Ionicons name="briefcase-outline" size={20} color={COLORS.accent} />
        <Text style={styles.sectionTitle}>Official Agents</Text>
      </View>

      {agents.map((agent) => (
        <View key={agent.id} style={styles.card}>
          <View style={styles.cardIcon}>
            <Ionicons name="person-outline" size={18} color={COLORS.accent} />
          </View>
          <Text style={styles.cardName}>{agent.name}</Text>
          <TouchableOpacity onPress={() => openDeleteModal(agent)} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)}>
        <Ionicons name="add" size={24} color="#000" />
        <Text style={styles.addBtnText}>Add Agent</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <View style={styles.sectionHeaderRow}>
        <Ionicons name="alert-circle-outline" size={20} color={COLORS.accent} />
        <Text style={styles.sectionTitle}>Pending Requests</Text>
      </View>

      {requests.length === 0 ? (
        <Text style={styles.emptyText}>No pending agent requests.</Text>
      ) : (
        requests.map((user) => (
          <View key={user.id} style={styles.requestCard}>
            <Text style={styles.requestName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.requestDetail}>Requested: {user.requestedAgentName}</Text>
            <View style={styles.requestActions}>
              <AppButton
                title="Map Existing"
                onPress={() => openMapModal(user)}
                variant="ghost"
                style={{ flex: 1, marginRight: 8 }}
              />
              <AppButton
                title="Add & Assign"
                onPress={() => handleAddAndAssign(user)}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        ))
      )}

      <Modal visible={addModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Agent</Text>
            <AppInput
              label="Agent Name"
              placeholder="Enter agent name"
              value={newAgentName}
              onChangeText={setNewAgentName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <AppButton
                title="Cancel"
                onPress={() => setAddModalVisible(false)}
                variant="ghost"
                style={{ flex: 1, marginRight: 8 }}
              />
              <AppButton title="Add" onPress={handleAddAgent} style={{ flex: 1, marginLeft: 8 }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={mapModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Map Request</Text>
            <Text style={styles.modalSub}>{selectedRequest?.requestedAgentName || '-'}</Text>
            <AgentSelect
              value={selectedAgent}
              onChange={setSelectedAgent}
              options={agents.map((agent) => agent.name)}
            />
            <View style={styles.modalActions}>
              <AppButton
                title="Cancel"
                onPress={() => setMapModalVisible(false)}
                variant="ghost"
                style={{ flex: 1, marginRight: 8 }}
              />
              <AppButton
                title="Assign"
                onPress={handleMapRequest}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ConfirmationModal
        visible={deleteModalVisible}
        title="Remove Agent"
        message={`Remove ${agentToDelete?.name || 'this agent'} from the official list?`}
        onConfirm={handleDeleteAgent}
        onCancel={() => setDeleteModalVisible(false)}
        confirmText="Remove"
        variant="danger"
        icon="trash-outline"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, width: '100%' },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800', marginLeft: 10 },
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141812',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A3028',
    padding: 14,
    marginBottom: 10,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A3028',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardName: { color: COLORS.textPrimary, flex: 1, fontSize: 15, fontWeight: '700' },
  iconBtn: { padding: 8 },
  addBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    height: 48,
    borderRadius: 12,
    marginTop: 8,
  },
  addBtnText: { color: '#000', fontWeight: '700', fontSize: 15, marginLeft: 8 },
  divider: { width: '100%', height: 1, backgroundColor: '#1F241D', marginVertical: 28 },
  requestCard: {
    width: '100%',
    backgroundColor: '#141812',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A3028',
    padding: 14,
    marginBottom: 12,
  },
  requestName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '800', marginBottom: 4 },
  requestDetail: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 14 },
  requestActions: { flexDirection: 'row' },
  emptyText: { color: COLORS.textSecondary, width: '100%', textAlign: 'center', marginTop: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#141812',
    padding: 24,
    borderRadius: 20,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: '#2A3028',
  },
  modalTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  modalSub: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 16 },
  modalActions: { flexDirection: 'row', marginTop: 12 },
});
