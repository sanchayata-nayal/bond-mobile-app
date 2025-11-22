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
  ScrollView,
  Dimensions,
  Modal,
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

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const HORIZONTAL_PADDING = LAYOUT.pagePadding || 20;
const CARD_MAX_WIDTH = Math.min(680, SCREEN_WIDTH - HORIZONTAL_PADDING * 2); // for tablets keep it sane

/* ---------- date parse and validation ---------- */
const parseDateFromString = (str: string) => {
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const d = parseInt(parts[0], 10),
    m = parseInt(parts[1], 10) - 1,
    y = parseInt(parts[2], 10);
  const dt = new Date(y, m, d);
  return isNaN(dt.getTime()) ? null : dt;
};

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  dob: yup
    .string()
    .required('Date of birth required')
    .test('age', 'You must be 18 or older', (val) => {
      if (!val) return false;
      const dt = parseDateFromString(val);
      if (!dt) return false;
      const age = (Date.now() - dt.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return age >= 18;
    }),
  phone: yup.string().required('Phone required').matches(/^\d{10}$/, 'Enter 10 digit US phone'),
  password: yup
    .string()
    .required('Password required')
    .min(6, 'Min 6 chars')
    .max(15, 'Max 15 chars')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,15}$/, 'Letters and at least one number'),
  agent: yup.string().required('Agent required'),
  ec1Name: yup.string().required('EC1 name required'),
  ec1Phone: yup.string().required('EC1 phone required').matches(/^\d{10}$/, 'Enter 10 digit US phone'),
  ec2Name: yup.string().required('EC2 name required'),
  ec2Phone: yup.string().required('EC2 phone required').matches(/^\d{10}$/, 'Enter 10 digit US phone'),
  ec3Name: yup.string().required('EC3 name required'),
  ec3Phone: yup.string().required('EC3 phone required').matches(/^\d{10}$/, 'Enter 10 digit US phone'),
}).required();

export default function SignUp({ navigation }: any) {
  const headingAnim = useRef(new Animated.Value(0)).current;
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  useEffect(() => {
    Animated.timing(headingAnim, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, []);

  const { control, handleSubmit, formState, setValue } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      dob: '',
      phone: '',
      password: '',
      agent: '',
      ec1Name: '',
      ec1Phone: '',
      ec2Name: '',
      ec2Phone: '',
      ec3Name: '',
      ec3Phone: '',
    },
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: any) => {
    demoStore.setUser({
      id: Math.random().toString(36).slice(2, 9),
      firstName: data.firstName,
      lastName: data.lastName,
      dob: data.dob,
      phone: `+1${data.phone}`,
      agent: data.agent,
      emergencyContacts: [
        { name: data.ec1Name, phone: `+1${data.ec1Phone}` },
        { name: data.ec2Name, phone: `+1${data.ec2Phone}` },
        { name: data.ec3Name, phone: `+1${data.ec3Phone}` },
      ],
    });

    setShowDisclaimerModal(false);
    Alert.alert('Account created', 'Welcome aboard — your profile is ready.', [
      { text: 'Continue', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'UserLanding' }] }) },
    ]);
  };

  /* lightweight country indicator for phone fields (keeps UI minimal) */
  const CountryPill = () => (
    <View style={styles.countryPill}>
      <Text style={styles.countryText}>+1</Text>
      <Ionicons name="chevron-down" size={14} color={COLORS.textSecondary} style={{ marginLeft: 6 }} />
    </View>
  );

  return (
    <ScreenContainer scrollable={false}>
      {/* DISCLAIMER MODAL — compact & elegant */}
      <Modal visible={showDisclaimerModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>Data Use & Consent</Text>
            <Text style={styles.disclaimerText}>
              By creating an account you consent to the collection and limited use of the personal and emergency contact
              information you provide, solely to deliver emergency-response and safety services. Your data will be handled
              securely and in accordance with our privacy practices.
            </Text>

            <View style={styles.disclaimerActions}>
              <TouchableOpacity style={[styles.disclaimerBtn, styles.disclaimerBtnGhost]} onPress={() => setShowDisclaimerModal(false)}>
                <Text style={styles.disclaimerBtnGhostText}>Cancel</Text>
              </TouchableOpacity>

              <View style={{ width: 10 }} />

              <TouchableOpacity
                style={[styles.disclaimerBtn, styles.disclaimerBtnPrimary]}
                onPress={handleSubmit(onSubmit)}
                activeOpacity={0.9}
              >
                <Text style={styles.disclaimerBtnPrimaryText} numberOfLines={1} ellipsizeMode="tail">
                  I Accept — Create account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, width: '100%', alignItems: 'center' }}
      >
        <ScrollView
          // crucial: ensure the scroll area is at least viewport-high so browser scrolling works
          contentContainerStyle={[styles.scrollContent, { flexGrow: 1, minHeight: SCREEN_HEIGHT }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          style={{ width: '100%' }}
        >
          <Animated.View
            style={[
              styles.headerWrap,
              {
                opacity: headingAnim,
                transform: [{ translateY: headingAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
              },
            ]}
          >
            <Text style={styles.h1}>Create an Account</Text>
            <Text style={styles.h2}>Register quickly — all fields are required for safety.</Text>
          </Animated.View>

          <View style={[styles.card, { maxWidth: CARD_MAX_WIDTH, width: '100%' }]}>
            {/* each field stacked vertically, modular */}
            <Controller control={control} name="firstName" render={({ field, fieldState }) => (
              <AppInput
                label="First name"
                icon="person"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                placeholder="John"
                error={fieldState.error?.message}
              />
            )} />

            <Controller control={control} name="lastName" render={({ field, fieldState }) => (
              <AppInput
                label="Last name"
                icon="person-outline"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                placeholder="Doe"
                error={fieldState.error?.message}
              />
            )} />

            <Controller control={control} name="dob" render={({ field, fieldState }) => (
              <DatePickerField
                label="Date of Birth"
                value={field.value}
                onChange={(val: string) => setValue('dob', val, { shouldValidate: true })}
                error={fieldState.error?.message}
              />
            )} />

            <Controller control={control} name="phone" render={({ field, fieldState }) => (
              <View style={styles.phoneRowFull}>
                <CountryPill />
                <AppInput
                  label="Phone number"
                  placeholder="5551234567"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  keyboardType="number-pad"
                />
              </View>
            )} />

            <Controller control={control} name="password" render={({ field, fieldState }) => (
              <PasswordInput
                label="Password"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
                placeholder="6-15 chars, at least one number"
              />
            )} />

            <Controller control={control} name="agent" render={({ field, fieldState }) => (
              <AppInput
                label="Agent name"
                icon="business"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                placeholder="Agent name"
              />
            )} />

            {/* emergency contacts: inline stacked collapsible for clarity */}
            <Collapsible title="Emergency Contact 1 (required)" startOpen>
              <Controller control={control} name="ec1Name" render={({ field, fieldState }) => (
                <AppInput label="Name" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
              )} />
              <Controller control={control} name="ec1Phone" render={({ field, fieldState }) => (
                <AppInput label="Phone" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} keyboardType="number-pad" />
              )} />
            </Collapsible>

            <Collapsible title="Emergency Contact 2 (required)">
              <Controller control={control} name="ec2Name" render={({ field, fieldState }) => (
                <AppInput label="Name" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
              )} />
              <Controller control={control} name="ec2Phone" render={({ field, fieldState }) => (
                <AppInput label="Phone" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} keyboardType="number-pad" />
              )} />
            </Collapsible>

            <Collapsible title="Emergency Contact 3 (required)">
              <Controller control={control} name="ec3Name" render={({ field, fieldState }) => (
                <AppInput label="Name" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
              )} />
              <Controller control={control} name="ec3Phone" render={({ field, fieldState }) => (
                <AppInput label="Phone" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} keyboardType="number-pad" />
              )} />
            </Collapsible>

            <Text style={styles.help}>We’ll only use this information for emergency contact and safety.</Text>

            <View style={{ height: 12 }} />

            {/* instead of directly submitting, open the disclaimer modal for final consent */}
            <AppButton title="Create Account" disabled={!formState.isValid} onPress={() => setShowDisclaimerModal(true)} />
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.smallText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}> Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 18,
    paddingBottom: 120,
    width: '100%',
    alignItems: 'center',
  },
  headerWrap: { width: '100%', marginBottom: 12, alignItems: 'flex-start' },
  h1: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '800', marginBottom: 6 },
  h2: { color: COLORS.textSecondary, fontSize: 13.5 },

  card: {
    width: '100%',
    borderRadius: 14,
    padding: 18,
    backgroundColor: '#0C0E0B',
    // soft shadow
    ...(Platform.OS === 'web' ? ({ boxShadow: '0 12px 30px rgba(0,0,0,0.36)' } as any) : { shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 12, elevation: 6 }),
    marginBottom: 20,
  },

  phoneRowFull: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  countryPill: {
    minWidth: 86,
    paddingHorizontal: 10,
    height: LAYOUT.controlHeight,
    borderRadius: LAYOUT.borderRadius,
    backgroundColor: '#0A0C09',
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  countryText: { color: COLORS.textPrimary, fontWeight: '700' },

  help: { color: COLORS.textSecondary, fontSize: 12, marginTop: 8 },

  loginRow: { width: '100%', flexDirection: 'row', justifyContent: 'center', marginTop: 6 },
  smallText: { color: COLORS.textSecondary },
  linkText: { color: COLORS.accent, fontWeight: '700' },

  /* ---- disclaimer modal styles ---- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4,6,4,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  disclaimerCard: {
    width: Math.min(760, SCREEN_WIDTH - 48),
    backgroundColor: '#0C0E0B',
    borderRadius: 12,
    padding: 14,
    ...(Platform.OS === 'web' ? ({ boxShadow: '0 16px 40px rgba(0,0,0,0.45)' } as any) : { shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 12, elevation: 8 }),
  },
  disclaimerTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  disclaimerText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },

  disclaimerActions: { marginTop: 12, flexDirection: 'row', alignItems: 'center' },
  disclaimerBtn: { flex: 1, height: LAYOUT.controlHeight, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  disclaimerBtnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginRight: 10 },
  disclaimerBtnPrimary: { backgroundColor: COLORS.accent },
  disclaimerBtnGhostText: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 14 },
  disclaimerBtnPrimaryText: { color: '#0F150D', fontWeight: '800', fontSize: 14 },
});
