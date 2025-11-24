// src/screens/UserDetails.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity,
  Modal,
  TextInput,
  ToastAndroid
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import ScreenContainer from '../components/ScreenContainer';
import DashboardHeader from '../components/DashboardHeader';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import DatePickerField from '../components/DatePickerField';
import Collapsible from '../components/Collapsible';
import ConfirmationModal from '../components/ConfirmationModal';
import { demoStore, User } from '../services/demoStore';
import { COLORS, LAYOUT } from '../styles/theme';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';

export default function UserDetails({ navigation, route }: any) {
  // If route.params.user exists, we are in Admin View mode
  const paramUser = route.params?.user as User | undefined;
  const currentUser = demoStore.getUser();
  
  // Effective user to display (Admin param OR logged in user)
  const displayUser = paramUser || currentUser;
  const isAdminMode = !!paramUser; 

  const [isEditing, setIsEditing] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      firstName: '', lastName: '', dob: '', phone: '', agent: '',
      ec1Name: '', ec1Phone: '', ec2Name: '', ec2Phone: '', ec3Name: '', ec3Phone: '',
    }
  });

  // Initialize Form Data
  useEffect(() => {
    if (displayUser) {
      reset({
        firstName: displayUser.firstName,
        lastName: displayUser.lastName,
        dob: displayUser.dob,
        phone: displayUser.phone?.replace('+1', '') || '',
        agent: displayUser.agent,
        ec1Name: displayUser.emergencyContacts?.[0]?.name || '',
        ec1Phone: displayUser.emergencyContacts?.[0]?.phone?.replace('+1', '') || '',
        ec2Name: displayUser.emergencyContacts?.[1]?.name || '',
        ec2Phone: displayUser.emergencyContacts?.[1]?.phone?.replace('+1', '') || '',
        ec3Name: displayUser.emergencyContacts?.[2]?.name || '',
        ec3Phone: displayUser.emergencyContacts?.[2]?.phone?.replace('+1', '') || '',
      });
    }
  }, [displayUser]);

  const handleSave = (data: any) => {
    if (displayUser) {
      const updatedUser: User = {
        ...displayUser,
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob,
        phone: `+1${data.phone}`,
        agent: data.agent,
        emergencyContacts: [
          { name: data.ec1Name, phone: `+1${data.ec1Phone}` },
          { name: data.ec2Name, phone: `+1${data.ec2Phone}` },
          { name: data.ec3Name, phone: `+1${data.ec3Phone}` },
        ]
      };
      
      // Save to store (works for both Admin update and Self update)
      demoStore.updateUser(updatedUser);
      
      setIsEditing(false);
      setSuccessVisible(true);
    }
  };

  const handleCopyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
    } else {
      Alert.alert('Copied', text);
    }
  };

  const confirmDelete = () => {
    if (displayUser) {
      demoStore.deleteUser(displayUser.id);
      
      if (isAdminMode) {
        navigation.goBack(); // Go back to list
      } else {
        demoStore.clear();
        navigation.reset({ index: 0, routes: [{ name: 'Starting' }] });
      }
    }
  };

  const InfoRow = ({ label, value, copyable }: { label: string, value: string, copyable?: boolean }) => (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.value}>{value || '-'}</Text>
        {copyable && value ? (
          <TouchableOpacity onPress={() => handleCopyToClipboard(value)} style={{ marginLeft: 10 }}>
            <Ionicons name="copy-outline" size={16} color={COLORS.accent} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  return (
    <ScreenContainer scrollable>
      <DashboardHeader 
        title={isAdminMode ? "User Profile" : "My Profile"} 
        showBack 
        onBackPress={() => navigation.goBack()} 
        userInitial={displayUser?.firstName || 'U'} 
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
            /* EDIT FORM */
            <View>
              <Controller control={control} name="firstName" render={({ field }) => <AppInput label="First Name" {...field} onChangeText={field.onChange} />} />
              <Controller control={control} name="lastName" render={({ field }) => <AppInput label="Last Name" {...field} onChangeText={field.onChange} />} />
              <Controller control={control} name="dob" render={({ field }) => <DatePickerField label="Date of Birth" value={field.value} onChange={field.onChange} />} />
              <Controller control={control} name="phone" render={({ field }) => <AppInput label="Phone" keyboardType="phone-pad" {...field} onChangeText={field.onChange} />} />
              <Controller control={control} name="agent" render={({ field }) => <AppInput label="Agent Name" {...field} onChangeText={field.onChange} />} />
              
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Emergency Contacts</Text>
              <View style={{ height: 12 }} />
              
              <Collapsible title="Contact 1">
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
            /* READ ONLY VIEW */
            <View>
              <InfoRow label="Name" value={`${displayUser?.firstName} ${displayUser?.lastName}`} />
              <InfoRow label="Email" value={displayUser?.email || ''} copyable />
              <InfoRow label="Phone" value={displayUser?.phone || ''} copyable />
              <InfoRow label="Date of Birth" value={displayUser?.dob || '-'} />
              <InfoRow label="Agent" value={displayUser?.agent || '-'} />

              <View style={styles.divider} />
              <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Emergency Contacts</Text>
              
              {(displayUser?.emergencyContacts || []).map((c: any, i: number) => (
                <View key={i} style={styles.contactCard}>
                  <View style={styles.contactHeader}>
                    <View style={styles.contactBadge}>
                      <Text style={styles.contactBadgeText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.contactName}>{c.name}</Text>
                  </View>
                  <View style={styles.contactBody}>
                    <Text style={styles.contactPhone}>{c.phone}</Text>
                    {c.phone ? (
                      <TouchableOpacity onPress={() => handleCopyToClipboard(c.phone)} style={{ marginLeft: 10 }}>
                        <Ionicons name="copy-outline" size={14} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Footer Actions */}
        <View style={{ marginTop: 24, width: '100%' }}>
          {!isAdminMode && !isEditing && (
            <>
              <AppButton title="Log Out" onPress={() => setLogoutVisible(true)} variant="ghost" />
              <AppButton title="Delete Account" onPress={() => setDeleteVisible(true)} variant="danger" style={{ marginTop: 12 }} />
            </>
          )}
          
          {isAdminMode && !isEditing && (
            <AppButton title="Delete User" onPress={() => setDeleteVisible(true)} variant="danger" />
          )}
        </View>

        {!isAdminMode && (
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>All State Bail Bond Services</Text>
            <Text style={styles.footerText}>0007 A Happy Suite Z, North East City</Text>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Modals */}
      <ConfirmationModal
        visible={logoutVisible}
        title="Log Out"
        message="Are you sure?"
        onConfirm={() => { setLogoutVisible(false); demoStore.clear(); navigation.reset({ index: 0, routes: [{ name: 'Starting' }] }); }}
        onCancel={() => setLogoutVisible(false)}
        confirmText="Log Out"
        variant="danger"
      />

      <ConfirmationModal
        visible={deleteVisible}
        title={isAdminMode ? "Delete User" : "Delete Account"}
        message="This action is permanent. Are you sure?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteVisible(false)}
        confirmText="Delete"
        variant="danger"
      />

      <ConfirmationModal
        visible={successVisible}
        title="Success"
        message="Profile updated successfully."
        onConfirm={() => setSuccessVisible(false)}
        onCancel={() => setSuccessVisible(false)}
        confirmText="OK"
        cancelText=""
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
  footerText: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center' },
});