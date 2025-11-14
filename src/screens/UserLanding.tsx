import React, { useRef, useEffect, useState } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { demoStore } from '../services/demoStore';
import { COLORS } from '../styles/theme';
import * as Linking from 'expo-linking';
import AppButton from '../components/AppButton';
import { Ionicons } from '@expo/vector-icons';

export default function UserLanding({ navigation }: any) {
  const user = demoStore.getUser();
  const scale = useRef(new Animated.Value(1)).current;
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(scale, { toValue: 1.06, duration: 900, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1.0, duration: 900, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  const onPanic = async () => {
    // For production: use expo-location to get coords and build maps link
    const maps = user ? `https://maps.google.com/?q=0,0` : 'https://maps.google.com';
    const message = `${user?.firstName || 'User'} ${user?.lastName || ''} has triggered the panic button.\nHere is the location: ${maps}\nAgent name: ${user?.agent || ''}\nEmergency contacts:\n${(user?.emergencyContacts || []).map((c:any) => `- ${c.name} ${c.phone}`).join('\n')}`;

    const smsUrl = Platform.select({ ios: `sms:&body=${encodeURIComponent(message)}`, android: `sms:?body=${encodeURIComponent(message)}` }) as string;
    Linking.openURL(smsUrl).catch(() => alert('Cannot open SMS composer on this device'));
  };

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.header}>
        <Text style={styles.appName}>Bond</Text>
        <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.accountBtn}>
          <Ionicons name="person-circle-outline" size={28} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      <View style={styles.center}>
        <Text style={{ color: COLORS.textPrimary, fontSize: 26, fontWeight: '800' }}>Welcome{user ? `, ${user.firstName}` : ''}</Text>
        <Text style={{ color: COLORS.textSecondary, marginTop: 8, textAlign: 'center', maxWidth: 420 }}>Tap the Panic button when you need assistance</Text>

        <Animated.View style={{ marginTop: 28, transform: [{ scale }] }}>
          <TouchableOpacity onPress={onPanic} style={styles.panic}>
            <Text style={styles.panicText}>PANIC</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ marginTop: 18 }}>
          <AppButton title="View Profile" onPress={() => navigation.navigate('UserDetails')} variant="ghost" />
        </View>
      </View>

      <Modal visible={menuOpen} animationType="slide" transparent>
        <View style={styles.modalWrap}>
          <View style={styles.menu}>
            <TouchableOpacity onPress={() => { setMenuOpen(false); navigation.navigate('UserDetails'); }} style={styles.menuItem}>
              <Text style={styles.menuText}>Account</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setMenuOpen(false); alert('Reset password flow'); }} style={styles.menuItem}>
              <Text style={styles.menuText}>Reset Password</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { demoStore.clear(); navigation.reset({ index:0, routes:[{ name: 'Starting' }] }); }} style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: '#121212' }]}>
              <Text style={[styles.menuText, { color: COLORS.panic }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const nativeShadow = {
  shadowColor: '#000',
  shadowOpacity: 0.35,
  shadowRadius: 12,
  elevation: 8,
};

const styles = StyleSheet.create({
  header: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6 },
  appName: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '800' },
  accountBtn: { padding: 6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  panic: {
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: COLORS.panic,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 12px 30px rgba(0,0,0,0.35)' }
      : nativeShadow),
  },
  panicText: { color: '#fff', fontSize: 28, fontWeight: '900' },
  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  menu: { backgroundColor: '#0F150D', padding: 16, borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  menuItem: { paddingVertical: 14 },
  menuText: { color: COLORS.textPrimary, fontSize: 16 },
});
