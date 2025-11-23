// src/screens/UserDetails.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity,
  Modal,
  TextInput
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import DashboardHeader from '../components/DashboardHeader';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import DatePickerField from '../components/DatePickerField';
import Collapsible from '../components/Collapsible';
import ConfirmationModal from '../components/ConfirmationModal';
import { demoStore } from '../services/demoStore';
import { COLORS, LAYOUT } from '../styles/theme';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Ionicons } from '@expo/vector-icons';

/* ---------- Schemas ---------- */
const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string(),
  dob: yup.string().required('Date of birth required'),
  phone: yup.string().required('Phone required').matches(/^\d{10}$/, '10 digits required'),
  agent: yup.string().required('Agent required'),
  ec1Name: yup.string().required('Contact 1 Name required'),
  ec1Phone: yup.string().required('Contact 1 Phone required'),
  ec2Name: yup.string().required('Contact 2 Name required'),
  ec2Phone: yup.string().required('Contact 2 Phone required'),
  ec3Name: yup.string().required('Contact 3 Name required'),
  ec3Phone: yup.string().required('Contact 3 Phone required'),
}).required();

const passwordSchema = yup.object({
  newPassword: yup.string().required('Required').min(6, 'Min 6 chars').matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, 'Alpha-numeric required'),
  confirmPassword: yup.string().required('Required').oneOf([yup.ref('newPassword')], 'Passwords must match'),
}).required();

export default function UserDetails({ navigation }: any) {
  const user = demoStore.getUser();
  const [isEditing, setIsEditing] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      dob: user?.dob || '',
      phone: user?.phone?.replace('+1', '') || '',
      agent: user?.agent || '',
      ec1Name: user?.emergencyContacts?.[0]?.name || '',
      ec1Phone: user?.emergencyContacts?.[0]?.phone?.replace('+1', '') || '',
      ec2Name: user?.emergencyContacts?.[1]?.name || '',
      ec2Phone: user?.emergencyContacts?.[1]?.phone?.replace('+1', '') || '',
      ec3Name: user?.emergencyContacts?.[2]?.name || '',
      ec3Phone: user?.emergencyContacts?.[2]?.phone?.replace('+1', '') || '',
    },
    resolver: yupResolver(schema),
  });

  const { 
    control: passControl, 
    handleSubmit: handlePassSubmit, 
    reset: resetPass 
  } = useForm({
    defaultValues: { newPassword: '', confirmPassword: '' },
    resolver: yupResolver(passwordSchema)
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
        emergencyContacts: [
          { name: data.ec1Name, phone: `+1${data.ec1Phone}` },
          { name: data.ec2Name, phone: `+1${data.ec2Phone}` },
          { name: data.ec3Name, phone: `+1${data.ec3Phone}` },
        ]
      });
    }
    setIsEditing(false);
    setSuccessVisible(true);
  };

  const handlePasswordChange = (data: any) => {
    // Mock password update
    setPasswordModalVisible(false);
    resetPass();
    setTimeout(() => {
      Alert.alert("Success", "Your password has been updated.");
    }, 500);
  };

  const confirmLogout = () => {
    setLogoutVisible(false);
    demoStore.clear();
    navigation.reset({ index: 0, routes: [{ name: 'Starting' }] });
  };

  const confirmDelete = () => {
    setDeleteVisible(false);
    demoStore.clear();
    navigation.reset({ index: 0, routes: [{ name: 'Starting' }] });
  };

  const InfoRow = ({ label, value }: { label: string, value: string }) => (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '-'}</Text>
    </View>
  );

  const ContactCard = ({ contact, index }: { contact: any, index: number }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactHeader}>
        <View style={styles.contactBadge}>
          <Text style={styles.contactBadgeText}>{index + 1}</Text>
        </View>
        <Text style={styles.contactName}>{contact.name}</Text>
      </View>
      <View style={styles.contactBody}>
        <Ionicons name="call-outline" size={16} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
        <Text style={styles.contactPhone}>{contact.phone}</Text>
      </View>
    </View>
  );

  // Simple Inline Password Input
  const SimplePassInput = ({ value, onChangeText, placeholder, autoFocus }: any) => (
    <View style={{ marginBottom: 12 }}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#777"
        secureTextEntry={false} // Visible by default for safety per previous request
        style={styles.simpleInput}
        autoFocus={autoFocus}
        autoCapitalize="none"
      />
    </View>
  );

  return (
    <ScreenContainer scrollable>
      <DashboardHeader title="My Profile" showBack onBackPress={() => navigation.goBack()} userInitial={user?.firstName || 'U'} onMenuPress={() => {}} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)} activeOpacity={0.7}>
                <Text style={styles.editLink}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditing ? (
            <View>
              <Controller control={control} name="firstName" render={({ field }) => <AppInput label="First Name" {...field} onChangeText={field.onChange} />} />
              <Controller control={control} name="lastName" render={({ field }) => <AppInput label="Last Name" {...field} onChangeText={field.onChange} />} />
              <Controller control={control} name="dob" render={({ field }) => <DatePickerField label="Date of Birth" value={field.value} onChange={field.onChange} />} />
              <Controller control={control} name="phone" render={({ field }) => <AppInput label="Phone" keyboardType="phone-pad" {...field} onChangeText={field.onChange} />} />
              <Controller control={control} name="agent" render={({ field }) => <AppInput label="Agent Name" {...field} onChangeText={field.onChange} />} />

              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Edit Contacts</Text>
              <View style={{ height: 12 }} />

              <Collapsible title="Contact 1" startOpen>
                <Controller control={control} name="ec1Name" render={({ field }) => <AppInput label="Name" {...field} onChangeText={field.onChange} />} />
                <Controller control={control} name="ec1Phone" render={({ field }) => <AppInput label="Phone" keyboardType="phone-pad" {...field} onChangeText={field.onChange} />} />
              </Collapsible>
              
              <Collapsible title="Contact 2">
                <Controller control={control} name="ec2Name" render={({ field }) => <AppInput label="Name" {...field} onChangeText={field.onChange} />} />
                <Controller control={control} name="ec2Phone" render={({ field }) => <AppInput label="Phone" keyboardType="phone-pad" {...field} onChangeText={field.onChange} />} />
              </Collapsible>

              <Collapsible title="Contact 3">
                <Controller control={control} name="ec3Name" render={({ field }) => <AppInput label="Name" {...field} onChangeText={field.onChange} />} />
                <Controller control={control} name="ec3Phone" render={({ field }) => <AppInput label="Phone" keyboardType="phone-pad" {...field} onChangeText={field.onChange} />} />
              </Collapsible>

              <View style={styles.editActions}>
                <AppButton title="Cancel" onPress={() => { reset(); setIsEditing(false); }} variant="ghost" style={{ flex: 1, marginRight: 8 }} />
                <AppButton title="Save Changes" onPress={handleSubmit(handleSave)} style={{ flex: 1, marginLeft: 8 }} />
              </View>
            </View>
          ) : (
            <View>
              <InfoRow label="Name" value={`${user?.firstName} ${user?.lastName}`} />
              <InfoRow label="Date of Birth" value={user?.dob || '-'} />
              <InfoRow label="Phone" value={user?.phone || '-'} />
              <InfoRow label="Agent" value={user?.agent || '-'} />
              <View style={styles.divider} />
              <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Emergency Contacts</Text>
              {(user?.emergencyContacts || []).map((c: any, i: number) => (
                <ContactCard key={i} contact={c} index={i} />
              ))}
            </View>
          )}
        </View>

        {!isEditing && (
          <View style={{ marginTop: 24, width: '100%' }}>
            <AppButton title="Change Password" onPress={() => setPasswordModalVisible(true)} variant="primary" style={{ marginBottom: 12, backgroundColor: '#1F241D', borderWidth: 1, borderColor: COLORS.accent }} />
            <AppButton title="Log Out" onPress={() => setLogoutVisible(true)} variant="ghost" />
            <AppButton title="Delete Account" onPress={() => setDeleteVisible(true)} variant="danger" style={{ marginTop: 12 }} />
          </View>
        )}

        <View style={styles.footer}>
          <Ionicons name="business" size={24} color={COLORS.textSecondary} style={{ marginBottom: 8 }} />
          <Text style={styles.footerTitle}>All State Bail Bond Services</Text>
          <Text style={styles.footerText}>0007 A Happy Suite Z</Text>
          <Text style={styles.footerText}>North East City Pensilvania</Text>
          <Text style={styles.footerText}>Tel: (561) 123-1234</Text>
          <Text style={styles.footerText}>Landmark: “ Building with The Statue of Liberty 🗽</Text>
        </View>
      </KeyboardAvoidingView>

      {/* Change Password Modal */}
      <Modal visible={passwordModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <Text style={styles.modalSub}>Create a new secure password.</Text>

            <Controller control={passControl} name="newPassword" render={({ field, fieldState }) => (
              <>
                <SimplePassInput placeholder="New Password (Min 6 chars)" value={field.value} onChangeText={field.onChange} autoFocus={true} />
                {fieldState.error && <Text style={styles.err}>{fieldState.error.message}</Text>}
              </>
            )} />

            <Controller control={passControl} name="confirmPassword" render={({ field, fieldState }) => (
              <>
                <SimplePassInput placeholder="Confirm New Password" value={field.value} onChangeText={field.onChange} />
                {fieldState.error && <Text style={styles.err}>{fieldState.error.message}</Text>}
              </>
            )} />

            <View style={{ marginTop: 12 }}>
              <AppButton title="Update" onPress={handleSubmit(handlePasswordChange)} />
              <AppButton title="Cancel" onPress={() => setPasswordModalVisible(false)} variant="ghost" />
            </View>
          </View>
        </View>
      </Modal>

      {/* Alerts */}
      <ConfirmationModal
        visible={logoutVisible}
        title="Log Out"
        message="Are you sure you want to log out?"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutVisible(false)}
        confirmText="Log Out"
        variant="danger"
        icon="log-out-outline"
      />

      <ConfirmationModal
        visible={deleteVisible}
        title="Delete Account"
        message="This action is permanent. You will lose all emergency contact data and access to the service. Are you sure?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteVisible(false)}
        confirmText="Delete Forever"
        variant="danger"
        icon="trash-outline"
      />

      <ConfirmationModal
        visible={successVisible}
        title="Profile Updated"
        message="Your details have been saved successfully."
        onConfirm={() => setSuccessVisible(false)}
        onCancel={() => setSuccessVisible(false)}
        confirmText="OK"
        cancelText=""
        variant="primary"
        icon="checkmark-circle-outline"
      />

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#0C0E0B', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1F241D', width: '100%' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: COLORS.accent, fontSize: 16, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  editLink: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
  infoRow: { marginBottom: 16 },
  label: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 4 },
  value: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#1F241D', marginVertical: 20 },
  editActions: { flexDirection: 'row', marginTop: 24 },
  contactCard: { backgroundColor: '#141812', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#2A3028' },
  contactHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  contactBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  contactBadgeText: { color: '#000', fontSize: 12, fontWeight: 'bold' },
  contactName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  contactBody: { flexDirection: 'row', alignItems: 'center', paddingLeft: 30 },
  contactPhone: { color: COLORS.textSecondary, fontSize: 14 },
  footer: { marginTop: 40, marginBottom: 40, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1F241D', paddingTop: 24 },
  footerTitle: { color: COLORS.textPrimary, fontWeight: '700', marginBottom: 6 },
  footerText: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 18 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#141812', padding: 24, borderRadius: 24, width: '100%', maxWidth: 420, borderWidth: 1, borderColor: '#2A3028' },
  modalTitle: { color: COLORS.textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  modalSub: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 20, textAlign: 'center' },
  simpleInput: {
    backgroundColor: '#0C0E0B', height: LAYOUT.controlHeight, borderRadius: 12, borderWidth: 1, borderColor: '#2A3028',
    paddingHorizontal: 12, color: COLORS.textPrimary, fontSize: 16
  },
  err: { color: COLORS.error, marginBottom: 10, fontSize: 12, marginTop: -8 }
});