// src/screens/UserLanding.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform, Linking, Alert } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import DashboardHeader from '../components/DashboardHeader';
import PanicButton from '../components/PanicButton';
import AppButton from '../components/AppButton';
import { demoStore } from '../services/demoStore';
import { COLORS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

// Optional: import * as Location from 'expo-location';

export default function UserLanding({ navigation }: any) {
  const user = demoStore.getUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [panicState, setPanicState] = useState<'idle' | 'active'>('idle');

  const handleLogout = () => {
    demoStore.clear();
    navigation.reset({ index: 0, routes: [{ name: 'Starting' }] });
  };

  const handlePanic = async () => {
    // 1. Get Location (Mocked for stability, use expo-location in prod)
    // let location = await Location.getCurrentPositionAsync({});
    // const mapLink = `https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
    const mapLink = 'https://maps.google.com/?q=37.78825,-122.4324'; // Mock SF location

    // 2. Construct Message
    const contacts = user?.emergencyContacts || [];
    const contactList = contacts.map((c: any) => `${c.name}: ${c.phone}`).join('\n');
    
    const body = [
      `🚨 EMERGENCY ALERT 🚨`,
      `${user?.firstName} ${user?.lastName} has triggered the panic button.`,
      `Location: ${mapLink}`,
      `Agent: ${user?.agent || 'Unknown'}`,
      `Contacts:\n${contactList}`
    ].join('\n\n');

    const smsUrl = Platform.select({
      ios: `sms:&body=${encodeURIComponent(body)}`,
      android: `sms:?body=${encodeURIComponent(body)}`,
    }) || '';

    // 3. Open SMS
    Linking.openURL(smsUrl).catch(() => 
      Alert.alert('Error', 'Could not open messaging app.')
    );

    // 4. Transition UI to "Post-Panic" state
    setPanicState('active');

    // 5. Auto-dial attempt (after 2s delay to allow SMS app to open first)
    setTimeout(() => {
      // In production, this number comes from Admin settings
      const agentNumber = 'tel:+15550000000'; 
      Linking.openURL(agentNumber).catch(() => {});
    }, 2500);
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
              <Text style={styles.status}>You are protected. Tap below for emergency.</Text>
            </View>

            <View style={styles.panicWrapper}>
              <PanicButton onPress={handlePanic} />
            </View>

            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.profileLink} 
                onPress={() => navigation.navigate('UserDetails')}
              >
                <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.profileLinkText}>Manage Profile & Contacts</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* Post-Panic State */
          <View style={styles.activeState}>
            <Ionicons name="alert-circle" size={64} color={COLORS.panic} style={{ marginBottom: 16 }} />
            <Text style={styles.activeTitle}>Emergency Mode Active</Text>
            <Text style={styles.activeDesc}>
              SMS composer opened. Please send the message. Dialing agent shortly...
            </Text>

            <View style={{ width: '100%', marginTop: 32 }}>
              <AppButton 
                title="Call Agent Now" 
                onPress={() => Linking.openURL('tel:+15550000000')} 
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

  /* Active State */
  activeState: { width: '100%', maxWidth: 340, alignItems: 'center', padding: 24, backgroundColor: '#141812', borderRadius: 20, borderWidth: 1, borderColor: COLORS.panic },
  activeTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 10 },
  activeDesc: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },

  /* Menu */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-start', alignItems: 'flex-end', padding: 20, paddingTop: 60 },
  menuContainer: { width: 220, backgroundColor: '#1A2018', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: '#2A3028', elevation: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8 },
  menuText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#2A3028', marginVertical: 4 },
});