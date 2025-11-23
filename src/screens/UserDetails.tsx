// src/screens/UserDetails.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity // <--- Added this missing import
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import DashboardHeader from '../components/DashboardHeader';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import DatePickerField from '../components/DatePickerField';
import { demoStore } from '../services/demoStore';
import { COLORS } from '../styles/theme';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Ionicons } from '@expo/vector-icons';

/* ---------- Validation Schema ---------- */
const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string(),
  dob: yup.string().required('Date of birth required'),
  phone: yup.string().required('Phone required').matches(/^\d{10}$/, '10 digits required'),
  agent: yup.string().required('Agent required'),
}).required();

export default function UserDetails({ navigation }: any) {
  const user = demoStore.getUser();
  const [isEditing, setIsEditing] = useState(false);

  const { control, handleSubmit, formState, reset } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      dob: user?.dob || '',
      phone: user?.phone?.replace('+1', '') || '',
      agent: user?.agent || '',
    },
    resolver: yupResolver(schema),
  });

  const handleSave = (data: any) => {
    if (user) {
      demoStore.setUser({
        ...user,
        firstName: data.firstName,
        lastName: data.lastName || '',
        dob: data.dob,
        phone: `+1${data.phone}`,
        agent: data.agent,
      });
    }
    setIsEditing(false);
    Alert.alert('Updated', 'Your profile has been updated.');
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert('Delete Account', 'Are you sure? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: () => {
          demoStore.clear();
          navigation.reset({ index: 0, routes: [{ name: 'Starting' }] });
        }
      }
    ]);
  };

  const InfoRow = ({ label, value }: { label: string, value: string }) => (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '-'}</Text>
    </View>
  );

  return (
    <ScreenContainer scrollable>
      <DashboardHeader 
        title="My Profile" 
        showBack 
        onBackPress={() => navigation.goBack()} 
        userInitial={user?.firstName || 'U'} 
        onMenuPress={() => {}} 
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)} activeOpacity={0.7}>
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditing ? (
            /* EDIT MODE FORM */
            <View>
              <Controller control={control} name="firstName" render={({ field, fieldState }) => (
                <AppInput label="First Name" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
              )} />
              <Controller control={control} name="lastName" render={({ field, fieldState }) => (
                <AppInput label="Last Name" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
              )} />
              <Controller control={control} name="dob" render={({ field, fieldState }) => (
                <DatePickerField label="Date of Birth" value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
              )} />
              <Controller control={control} name="phone" render={({ field, fieldState }) => (
                <AppInput label="Phone (10 digits)" keyboardType="phone-pad" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
              )} />
              <Controller control={control} name="agent" render={({ field, fieldState }) => (
                <AppInput label="Agent Name" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
              )} />

              <View style={styles.editActions}>
                <AppButton title="Cancel" onPress={handleCancel} variant="ghost" style={{ flex: 1, marginRight: 8 }} />
                <AppButton title="Save Changes" onPress={handleSubmit(handleSave)} style={{ flex: 1, marginLeft: 8 }} />
              </View>
            </View>
          ) : (
            /* READ ONLY MODE */
            <View>
              <InfoRow label="Name" value={`${user?.firstName} ${user?.lastName}`} />
              <InfoRow label="Date of Birth" value={user?.dob || '-'} />
              <InfoRow label="Phone" value={user?.phone || '-'} />
              <InfoRow label="Agent" value={user?.agent || '-'} />
            </View>
          )}
        </View>

        {/* Emergency Contacts */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <Text style={styles.subText}>To update these, please contact support or re-register.</Text>
          
          {(user?.emergencyContacts || []).map((c: any, i: number) => (
            <View key={i} style={styles.contactRow}>
              <View style={styles.contactIcon}>
                <Ionicons name="people" size={16} color={COLORS.background} />
              </View>
              <View>
                <Text style={styles.contactName}>{c.name}</Text>
                <Text style={styles.contactPhone}>{c.phone}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Danger Zone */}
        {!isEditing && (
          <View style={{ marginTop: 24, width: '100%' }}>
            <AppButton title="Log Out" onPress={() => { demoStore.clear(); navigation.reset({ index:0, routes:[{ name: 'Starting' }] }); }} variant="ghost" />
            <AppButton title="Delete Account" onPress={handleDelete} variant="danger" style={{ marginTop: 12 }} />
          </View>
        )}

        {/* Office Info Footer */}
        <View style={styles.footer}>
          <Ionicons name="business" size={24} color={COLORS.textSecondary} style={{ marginBottom: 8 }} />
          <Text style={styles.footerTitle}>All State Bail Bond Services</Text>
          <Text style={styles.footerText}>0007 A Happy Suite Z</Text>
          <Text style={styles.footerText}>North East City Pensilvania</Text>
          <View style={{ height: 8 }} />
          <Text style={styles.footerText}>Tel: (561) 123-1234</Text>
          <View style={{ height: 8 }} />
          <Text style={styles.footerText}>Landmark:</Text>
          <Text style={styles.footerText}>“ Building with The Statue of Liberty 🗽</Text>
        </View>

      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0C0E0B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F241D',
    width: '100%',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: COLORS.accent, fontSize: 16, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  editLink: { color: COLORS.textSecondary, fontSize: 14, textDecorationLine: 'underline' },
  subText: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 16 },
  
  infoRow: { marginBottom: 16 },
  label: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 4 },
  value: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '500' },

  editActions: { flexDirection: 'row', marginTop: 10 },

  contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  contactIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  contactName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  contactPhone: { color: COLORS.textSecondary, fontSize: 13 },

  footer: { marginTop: 40, marginBottom: 40, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1F241D', paddingTop: 24 },
  footerTitle: { color: COLORS.textPrimary, fontWeight: '700', marginBottom: 6 },
  footerText: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 18 },
});