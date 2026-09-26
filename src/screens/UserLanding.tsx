// src/screens/UserLanding.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import DashboardHeader from '../components/DashboardHeader';
import PanicButton from '../components/PanicButton';
import AppButton from '../components/AppButton';
import ConfirmationModal from '../components/ConfirmationModal';
import { firebaseStore, Recipient } from '../services/firebaseStore';
import { sessionStore } from '../services/sessionStore';
import { COLORS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { LOCATION_DISCLOSURE } from '../config/legal';
import { withTimeout } from '../utils/withTimeout';

export default function UserLanding({ navigation }: any) {
  const user = sessionStore.getUser();
  const [locationConsentVisible, setLocationConsentVisible] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [panicState, setPanicState] = useState<'idle' | 'active'>('idle');
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [primaryCall, setPrimaryCall] = useState('');
  const [smsRecipients, setSmsRecipients] = useState<Recipient[]>([]);

  useEffect(() => {
    firebaseStore
      .getAdminSettings()
      .then((settings) => {
        setPrimaryCall(settings.primaryCall);
        setSmsRecipients(settings.smsList);
      })
      .catch(() => {
        setPrimaryCall('');
        setSmsRecipients([]);
      });
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    setLogoutVisible(true);
  };

  const confirmLogout = () => {
    setLogoutVisible(false);
    firebaseStore.logout().catch(() => {});
    sessionStore.clear();
    navigation.reset({ index: 0, routes: [{ name: 'Starting' }] });
  };

  const handlePanic = async (includeLocation: boolean) => {
    if (isLocating || !user) return;
    setLocationConsentVisible(false);
    setIsLocating(true);

    try {
      let coords: { latitude: number; longitude: number; accuracy: number | null } | undefined;
      if (includeLocation) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          try {
            const position = await withTimeout(
              Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
              15000,
            );
            coords = position.coords;
          } catch {
            // Keep emergency messaging available when GPS fails.
          }
        }
      }
      const mapLink = coords
        ? `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`
        : 'Location unavailable or not shared';

      const contacts = user?.emergencyContacts || [];
      const contactList = contacts.map((c: any) => `${c.name}: ${c.phone}`).join('\n');
      const body = [
        'EMERGENCY ALERT',
        `${user?.firstName} ${user?.lastName} has triggered the panic button.`,
        `Location: ${mapLink}`,
        coords?.accuracy != null ? `Accuracy: ${coords.accuracy.toFixed(0)} meters` : '',
        `Agent: ${user?.agent || 'Unknown'}`,
        `Contacts:\n${contactList}`,
      ].join('\n\n');

      const recipientPhones = smsRecipients.map((recipient) => recipient.phone).filter(Boolean);
      const targetPhones =
        recipientPhones.length > 0 ? recipientPhones : primaryCall ? [primaryCall] : [];

      if (targetPhones.length === 0) {
        Alert.alert(
          'Routing Missing',
          'No emergency recipient or primary call number is configured.',
        );
        setIsLocating(false);
        return;
      }

      let logged = false;
      try {
        await withTimeout(firebaseStore.logPanicEvent(user, mapLink, coords), 3000);
        logged = true;
      } catch {
        // A database outage must not prevent opening the SMS composer.
      }

      let messageStatus =
        'Messaging app opened. Send the message there; delivery is not confirmed.';
      if (await SMS.isAvailableAsync()) {
        const { result } = await SMS.sendSMSAsync(targetPhones, body);
        messageStatus =
          result === 'cancelled'
            ? 'Message cancelled. No message was confirmed as sent.'
            : result === 'sent'
              ? 'Messaging app reported sent. Delivery and a response are not confirmed.'
              : messageStatus;
      } else {
        const separator = Platform.OS === 'ios' ? '&' : '?';
        await Linking.openURL(
          `sms:${targetPhones.join(',')}${separator}body=${encodeURIComponent(body)}`,
        );
      }
      setDeliveryStatus(
        `${logged ? 'Panic event saved.' : 'Saving the panic event could not be confirmed.'} ${messageStatus}${coords ? '' : ' Location was not included.'}`,
      );
      setPanicState('active');
    } catch (error) {
      Alert.alert('Error', 'Could not fetch location or open messaging.');
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <ScreenContainer scrollable>
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
                {isLocating
                  ? 'Acquiring GPS signal...'
                  : 'Tap below to prepare an emergency message.'}
              </Text>
            </View>

            <View style={[styles.panicWrapper, isLocating && { opacity: 0.7 }]}>
              <PanicButton onPress={() => setLocationConsentVisible(true)} disabled={isLocating} />
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
          <View style={styles.activeState}>
            <Ionicons
              name="alert-circle"
              size={64}
              color={COLORS.panic}
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.activeTitle}>Emergency Mode Active</Text>
            <Text style={styles.activeDesc}>{deliveryStatus}</Text>

            <View style={{ width: '100%', marginTop: 32 }}>
              <AppButton
                title="Call Agent"
                disabled={!primaryCall}
                onPress={() => primaryCall && Linking.openURL(`tel:${primaryCall}`)}
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

      <Modal visible={menuOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuOpen(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                navigation.navigate('UserDetails');
              }}
            >
              <Ionicons
                name="person"
                size={20}
                color={COLORS.textPrimary}
                style={{ marginRight: 12 }}
              />
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

      <ConfirmationModal
        visible={locationConsentVisible}
        title="Share location?"
        message={LOCATION_DISCLOSURE}
        onConfirm={() => void handlePanic(true)}
        onCancel={() => setLocationConsentVisible(false)}
        confirmText="Include location"
        cancelText="Cancel"
      />
      <TouchableOpacity
        onPress={() => void handlePanic(false)}
        disabled={isLocating}
        style={{ padding: 16 }}
      >
        <Text style={{ color: COLORS.textSecondary, textAlign: 'center' }}>
          Prepare message without location
        </Text>
      </TouchableOpacity>
      <Text style={{ color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 }}>
        For immediate danger, call local emergency services. Sending a message does not guarantee a
        response.
      </Text>
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
  footer: { marginBottom: 24 },
  profileLink: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  profileLinkText: { color: COLORS.textSecondary, fontSize: 14, marginLeft: 8, fontWeight: '600' },
  activeState: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#141812',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.panic,
  },
  activeTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 10 },
  activeDesc: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 20,
    paddingTop: 60,
  },
  menuContainer: {
    width: 220,
    backgroundColor: '#1A2018',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#2A3028',
    elevation: 10,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8 },
  menuText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#2A3028', marginVertical: 4 },
});
