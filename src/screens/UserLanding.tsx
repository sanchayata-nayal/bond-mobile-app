// src/screens/UserLanding.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform, Linking, Alert } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import DashboardHeader from '../components/DashboardHeader';
import PanicButton from '../components/PanicButton';
import AppButton from '../components/AppButton';
import ConfirmationModal from '../components/ConfirmationModal';
import { demoStore } from '../services/demoStore';
import { COLORS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// The primary number for both SMS and Calls
const AGENT_NUMBER = '+15615632245';

export default function UserLanding({ navigation }: any) {
  const user = demoStore.getUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [panicState, setPanicState] = useState<'idle' | 'active'>('idle');
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    setLogoutVisible(true);
  };

  const confirmLogout = () => {
    setLogoutVisible(false);
    demoStore.clear();
    navigation.reset({ index: 0, routes: [{ name: 'Starting' }] });
  };

  const handlePanic = async () => {
    setIsLocating(true);

    try {
      // 1. Request Permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need your location to send help.');
        setIsLocating(false);
        return;
      }

      // 2. Get Exact Location
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      
      // Google Maps Link
      const mapLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

      // 3. Construct Message
      const contacts = user?.emergencyContacts || [];
      const contactList = contacts.map((c: any) => `${c.name}: ${c.phone}`).join('\n');
      
      const body = [
        `🚨 EMERGENCY ALERT 🚨`,
        `${user?.firstName} ${user?.lastName} has triggered the panic button.`,
        `Location: ${mapLink}`,
        `Accuracy: ${location.coords.accuracy?.toFixed(0)} meters`,
        `Agent: ${user?.agent || 'Unknown'}`,
        `Contacts:\n${contactList}`
      ].join('\n\n');

      // 4. Open SMS (Targeting Agent Number)
      const separator = Platform.OS === 'ios' ? '&' : '?';
      const smsUrl = `sms:${AGENT_NUMBER}${separator}body=${encodeURIComponent(body)}`;

      await Linking.openURL(smsUrl);
      
      setPanicState('active');
      setIsLocating(false);

      // 5. Auto-dial Agent (Delay allows SMS app to open first)
      setTimeout(() => {
        Linking.openURL(`tel:${AGENT_NUMBER}`).catch(() => {});
      }, 2500);

    } catch (error) {
      Alert.alert('Error', 'Could not fetch location or open messaging.');
      setIsLocating(false);
    }
  };

  return (
    <ScreenContainer scrollable={false}>
      <DashboardHeader 
        title="All State Bail Bond Services" 
        userInitial={user?.firstName || 'U'} 
        onMenuPress={() => setMenuOpen(true)} 
      />

      <View style={styles.content}>
        {panicState === 'idle' ? (
          <>
            <View style={styles.welcomeBlock}>
              <Text style={styles.greeting}>Hello, {user?.firstName || 'User'}</Text>
              <Text style={styles.status}>
                {isLocating ? 'Acquiring GPS signal...' : 'You are protected. Tap below for emergency.'}
              </Text>
            </View>

            <View style={[styles.panicWrapper, isLocating && { opacity: 0.7 }]}>
              <PanicButton onPress={handlePanic} disabled={isLocating} />
            </View>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.profileLink} onPress={() => navigation.navigate('UserDetails')}>
                <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.profileLinkText}>Manage Profile & Contacts</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* Active Emergency State */
          <View style={styles.activeState}>
            <Ionicons name="alert-circle" size={64} color={COLORS.panic} style={{ marginBottom: 16 }} />
            <Text style={styles.activeTitle}>Emergency Mode Active</Text>
            <Text style={styles.activeDesc}>
              Location sent to Agent. SMS composer opened. Dialing {AGENT_NUMBER} shortly...
            </Text>

            <View style={{ width: '100%', marginTop: 32 }}>
              <AppButton 
                title="Call Agent Again" 
                onPress={() => Linking.openURL(`tel:${AGENT_NUMBER}`)} 
                variant="primary" 
                style={{ backgroundColor: COLORS.panic, marginBottom: 16 }}
              />
              <AppButton 
                title="I'm Safe / Cancel" 
                onPress={() => setPanicState('idle')} 
                variant="ghost" 
              />
            </View>
          </View>
        )}
      </View>

      {/* Menu Modal */}
      <Modal visible={menuOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); navigation.navigate('UserDetails'); }}>
              <Ionicons name="person" size={20} color={COLORS.textPrimary} style={{ marginRight: 12 }} />
              <Text style={styles.menuText}>My Profile</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out" size={20} color={COLORS.panic} style={{ marginRight: 12 }} />
              <Text style={[styles.menuText, { color: COLORS.panic }]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        visible={logoutVisible}
        title="Log Out"
        message="Are you sure you want to log out of your account?"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutVisible(false)}
        confirmText="Log Out"
        variant="danger"
        icon="log-out-outline"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
  welcomeBlock: { alignItems: 'center', marginBottom: 40 },
  greeting: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  status: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  panicWrapper: { marginBottom: 40 },
  footer: { position: 'absolute', bottom: 20 },
  profileLink: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  profileLinkText: { color: COLORS.textSecondary, fontSize: 14, marginLeft: 8, fontWeight: '600' },
  activeState: { width: '100%', maxWidth: 340, alignItems: 'center', padding: 24, backgroundColor: '#141812', borderRadius: 20, borderWidth: 1, borderColor: COLORS.panic },
  activeTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 10 },
  activeDesc: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-start', alignItems: 'flex-end', padding: 20, paddingTop: 60 },
  menuContainer: { width: 220, backgroundColor: '#1A2018', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: '#2A3028', elevation: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8 },
  menuText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#2A3028', marginVertical: 4 },
});