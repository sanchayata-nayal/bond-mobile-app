// src/screens/SignUp.tsx
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableOpacity,
  Alert,
  Modal,
  useWindowDimensions,
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import AppInput from '../components/AppInput';
import PasswordInput from '../components/PasswordInput';
import DatePickerField from '../components/DatePickerField';
import AppButton from '../components/AppButton';
import Collapsible from '../components/Collapsible';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { demoStore } from '../services/demoStore';
import { COLORS, LAYOUT } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

/* ---------- Validation Schema ---------- */
const parseDateFromString = (str: string) => {
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const y = parseInt(parts[2], 10);
  const dt = new Date(y, m, d);
  return isNaN(dt.getTime()) ? null : dt;
};

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  dob: yup.string().required('Date of birth required'),
  phone: yup.string().required('Phone required').matches(/^\d{10}$/, '10 digits required'),
  password: yup.string().required('Required').min(6, 'Min 6 chars'),
  agent: yup.string().required('Agent required'),
  ec1Name: yup.string().required('Name required'),
  ec1Phone: yup.string().required('Phone required').matches(/^\d{10}$/, '10 digits'),
  ec2Name: yup.string(),
  ec2Phone: yup.string(),
  ec3Name: yup.string(),
  ec3Phone: yup.string(),
}).required();

export default function SignUp({ navigation }: any) {
  const { width } = useWindowDimensions();
  const headingAnim = useRef(new Animated.Value(0)).current;
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Calculate dynamic max width for the form card
  const isTabletOrWeb = width > 600;
  const formWidth = isTabletOrWeb ? 500 : '100%';

  useEffect(() => {
    Animated.timing(headingAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const { control, handleSubmit, formState, setValue } = useForm({
    defaultValues: {
      firstName: '', lastName: '', dob: '', phone: '', password: '', agent: '',
      ec1Name: '', ec1Phone: '', ec2Name: '', ec2Phone: '', ec3Name: '', ec3Phone: '',
    },
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: any) => {
    // Save to store (Simulated backend)
    demoStore.setUser({
      id: Math.random().toString(36).slice(2, 9),
      firstName: data.firstName,
      lastName: data.lastName,
      dob: data.dob,
      phone: `+1${data.phone}`,
      agent: data.agent,
      emergencyContacts: [
        { name: data.ec1Name, phone: `+1${data.ec1Phone}` },
        ...(data.ec2Name ? [{ name: data.ec2Name, phone: `+1${data.ec2Phone}` }] : []),
      ],
    });
    setShowDisclaimer(false);
    Alert.alert('Success', 'Account created successfully.', [
      { text: 'Go to Dashboard', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'UserLanding' }] }) }
    ]);
  };

  const CountryPill = () => (
    <View style={styles.countryPill}>
      <Text style={styles.countryText}>🇺🇸 +1</Text>
    </View>
  );

  return (
    <ScreenContainer scrollable>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%', alignItems: 'center' }}>
        
        {/* Header Animation */}
        <Animated.View style={[styles.header, { opacity: headingAnim, transform: [{ translateY: headingAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Please fill in all required fields.</Text>
          </View>
        </Animated.View>

        {/* Form Card */}
        <View style={[styles.card, { width: formWidth }]}>
          
          {/* Personal Details */}
          <Text style={styles.sectionTitle}>Personal Details</Text>
          
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Controller control={control} name="firstName" render={({ field, fieldState }) => (
                <AppInput label="First Name" placeholder="Jane" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
              )} />
            </View>
            <View style={{ flex: 1 }}>
              <Controller control={control} name="lastName" render={({ field, fieldState }) => (
                <AppInput label="Last Name" placeholder="Doe" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
              )} />
            </View>
          </View>

          <Controller control={control} name="dob" render={({ field, fieldState }) => (
            <DatePickerField label="Date of Birth" value={field.value} onChange={(v) => setValue('dob', v, { shouldValidate: true })} error={fieldState.error?.message} />
          )} />

          <Controller control={control} name="phone" render={({ field, fieldState }) => (
            <View style={{ marginBottom: 14 }}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.phoneRow}>
                <CountryPill />
                <View style={{ flex: 1 }}>
                  <AppInput 
                    value={field.value} 
                    onChangeText={field.onChange} 
                    keyboardType="phone-pad" 
                    placeholder="555 123 4567"
                    error={fieldState.error?.message}
                    style={{ marginBottom: 0 }} // remove default margin inside row
                  />
                </View>
              </View>
            </View>
          )} />

          <Controller control={control} name="agent" render={({ field, fieldState }) => (
            <AppInput label="Agent Name" icon="business-outline" placeholder="Assigned Agent" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
          )} />

          <View style={styles.divider} />

          {/* Security */}
          <Text style={styles.sectionTitle}>Security</Text>
          <Controller control={control} name="password" render={({ field, fieldState }) => (
            <PasswordInput label="Password" placeholder="Create a password" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
          )} />

          <View style={styles.divider} />

          {/* Emergency Contacts */}
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <Text style={styles.sectionSub}>At least one contact is required.</Text>

          <Collapsible title="Contact 1 (Required)" startOpen>
            <Controller control={control} name="ec1Name" render={({ field, fieldState }) => (
              <AppInput label="Full Name" placeholder="Contact Name" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
            )} />
            <Controller control={control} name="ec1Phone" render={({ field, fieldState }) => (
              <AppInput label="Phone Number" placeholder="Contact Phone" keyboardType="phone-pad" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
            )} />
          </Collapsible>

          <Collapsible title="Contact 2 (Optional)">
            <Controller control={control} name="ec2Name" render={({ field }) => (
              <AppInput label="Full Name" placeholder="Contact Name" value={field.value} onChangeText={field.onChange} />
            )} />
            <Controller control={control} name="ec2Phone" render={({ field }) => (
              <AppInput label="Phone Number" placeholder="Contact Phone" keyboardType="phone-pad" value={field.value} onChangeText={field.onChange} />
            )} />
          </Collapsible>

          <View style={{ height: 20 }} />

          <AppButton 
            title="Create Account" 
            onPress={handleSubmit(() => setShowDisclaimer(true))} 
            disabled={!formState.isValid} 
          />
          
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ padding: 12, alignItems: 'center' }}>
            <Text style={{ color: COLORS.textSecondary }}>Already have an account? <Text style={{ color: COLORS.accent, fontWeight: 'bold' }}>Login</Text></Text>
          </TouchableOpacity>

        </View>
        
        <View style={{ height: 40 }} /> 
      </KeyboardAvoidingView>

      {/* Disclaimer Modal */}
      <Modal visible={showDisclaimer} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="shield-checkmark" size={42} color={COLORS.accent} style={{ marginBottom: 12 }} />
            <Text style={styles.modalTitle}>Data Privacy Consent</Text>
            <Text style={styles.modalText}>
              Your safety is our priority. By continuing, you agree that your location and emergency contact details will only be used to trigger SOS alerts when you press the panic button.
            </Text>
            <View style={styles.modalActions}>
              <AppButton title="Cancel" onPress={() => setShowDisclaimer(false)} variant="ghost" style={{ flex: 1, marginRight: 8 }} />
              <AppButton title="I Agree" onPress={handleSubmit(onSubmit)} style={{ flex: 1, marginLeft: 8 }} />
            </View>
          </View>
        </View>
      </Modal>

    </ScreenContainer>
  );
}

/*Styles*/
const styles = StyleSheet.create({
  header: { width: '100%', marginBottom: 20, marginTop: 10, flexDirection: 'row', alignItems: 'center' },
  backBtn: { padding: 8, marginRight: 8, borderRadius: 999, backgroundColor: '#1A2018' },
  title: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '800' },
  subtitle: { color: COLORS.textSecondary, fontSize: 14 },
  
  card: {
    backgroundColor: '#0C0E0B', // slightly lighter than background
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F241D',
  },
  sectionTitle: { color: COLORS.accent, fontSize: 16, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionSub: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 12, marginTop: -6 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  divider: { height: 1, backgroundColor: '#1F241D', marginVertical: 16 },
  
  label: { color: COLORS.textSecondary, marginBottom: 8, fontSize: 13 },
  phoneRow: { flexDirection: 'row' },
  countryPill: {
    justifyContent: 'center', alignItems: 'center', 
    paddingHorizontal: 12, backgroundColor: '#1A2018', 
    borderRadius: LAYOUT.borderRadius, marginRight: 8,
    height: LAYOUT.controlHeight, borderWidth: 1, borderColor: '#2A3028'
  },
  countryText: { color: COLORS.textPrimary, fontWeight: '700' },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#141812', padding: 24, borderRadius: 20, width: '100%', maxWidth: 400, alignItems: 'center', borderWidth: 1, borderColor: '#2A3028' },
  modalTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  modalText: { color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalActions: { flexDirection: 'row', width: '100%' }
});