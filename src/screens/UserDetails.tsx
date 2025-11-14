import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { demoStore } from '../services/demoStore';
import { COLORS } from '../styles/theme';
import AppButton from '../components/AppButton';
import { Ionicons } from '@expo/vector-icons';

export default function UserDetails({ navigation }: any) {
  const user = demoStore.getUser();

  return (
    <ScreenContainer>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.h1}>Your Details</Text>
        <View style={{ width: 28 }} />
      </View>

      <Text style={styles.label}>Name</Text>
      <Text style={styles.value}>{user ? `${user.firstName} ${user.lastName}` : '-'}</Text>

      <Text style={styles.label}>Agent</Text>
      <Text style={styles.value}>{user?.agent || '-'}</Text>

      <Text style={styles.label}>Phone</Text>
      <Text style={styles.value}>{user?.phone || '-'}</Text>

      <View style={{ height: 16 }} />

      <Text style={styles.h2}>Emergency Contacts</Text>
      {(user?.emergencyContacts || []).map((e:any, i:number) => (
        <View key={i} style={{ width: '100%', paddingVertical: 8 }}>
          <Text style={styles.value}>{e.name}</Text>
          <Text style={[styles.value, { color: COLORS.textSecondary }]}>{e.phone}</Text>
        </View>
      ))}

      <View style={{ marginTop: 18, width: '100%' }}>
        <AppButton title="Edit" onPress={() => alert('Edit flow (not implemented in demo)')} />
        <AppButton title="Delete Account" onPress={() => { demoStore.clear(); navigation.reset({ index:0, routes:[{ name: 'Starting' }] }); }} variant="danger" />
        <AppButton title="Logout" onPress={() => { demoStore.clear(); navigation.reset({ index:0, routes:[{ name: 'Starting' }] }); }} variant="ghost" />
      </View>

      <View style={{ marginTop: 24, alignItems: 'center' }}>
        <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>Bond Safety Solutions</Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>123 Business St, City</Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>Phone: +1 561 XXX XXXX</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  h1: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '800' },
  h2: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 12 },
  label: { color: COLORS.textSecondary, marginTop: 8 },
  value: { color: COLORS.textPrimary, fontSize: 16 }
});
