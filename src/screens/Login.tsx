// src/screens/Login.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import AppInput from '../components/AppInput';
import PasswordInput from '../components/PasswordInput';
import AppButton from '../components/AppButton';
import DatePickerField from '../components/DatePickerField';
import ConfirmationModal from '../components/ConfirmationModal';
import PhoneInput from '../components/PhoneInput';
import { useForm, Controller } from 'react-hook-form';
import { demoStore } from '../services/demoStore';
import { COLORS, LAYOUT } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

/* ---------- MOCK DATA ---------- */
const MOCK_USER = {
  id: 'test-user-001',
  firstName: 'John',
  lastName: 'Doe',
  dob: '05/15/1985',
  phone: '+15615550100',
  agent: 'Agent Smith',
  email: 'demo@bond.com',
  emergencyContacts: [
    { name: 'Jane Doe', phone: '+15615550199' },
    { name: 'Bob Smith', phone: '+15615550188' },
    { name: 'Alice Wonderland', phone: '+15615550177' },
  ],
};

/* ---------- SCHEMAS ---------- */
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
const PASSWORD_ERROR = 'Min 6 chars, letters & numbers required';

const loginSchema = yup.object({
  email: yup.string().email('Please enter a valid email').required('Email required'),
  password: yup.string().required('Password required').matches(PASSWORD_REGEX, PASSWORD_ERROR),
}).required();

const forgotIdentitySchema = yup.object({
  email: yup.string().email('Invalid email format').required('Required'),
  phone: yup.string().required('Required').matches(/^\d{10}$/, '10 digits required'),
  dob: yup.string().required('Required'),
  agent: yup.string().required('Required'),
}).required();

export default function Login({ navigation }: any) {
  /* --- LOGIN FORM --- */
  const { control, handleSubmit, formState } = useForm({
    defaultValues: { email: '', password: '' },
    resolver: yupResolver(loginSchema),
    mode: 'onChange'
  });

  /* --- STATE --- */
  const [forgotVisible, setForgotVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ visible: boolean, title: string, message: string, type: 'success' | 'error' }>({
    visible: false, title: '', message: '', type: 'error'
  });

  /* --- FORGOT PASSWORD FORM --- */
  const {
    control: identityControl,
    handleSubmit: handleIdentitySubmit,
    formState: identityState,
    reset: resetIdentity
  } = useForm({
    defaultValues: { email: '', phone: '', dob: '', agent: '' },
    resolver: yupResolver(forgotIdentitySchema),
    mode: 'onChange',
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error') => {
    setAlertConfig({ visible: true, title, message, type });
  };

  /* --- HANDLERS --- */
  // Inside src/screens/Login.tsx

  const onLogin = (data: any) => {
    // ADMIN CHECK
    if (data.email.toLowerCase() === 'admin@bond.com' && data.password === 'admin123') {
      // Navigate to Admin Flow
      navigation.reset({ index: 0, routes: [{ name: 'AdminLanding' }] });
      return;
    }

    // EXISTING USER CHECK
    if (data.email.toLowerCase() === 'demo@bond.com' && data.password === 'bond123') {
      demoStore.setUser(MOCK_USER);
      navigation.reset({ index: 0, routes: [{ name: 'UserLanding' }] });
    } else {
      showAlert('Login Failed', 'Invalid email or password.', 'error');
    }
  };

  const onVerifyIdentity = (data: any) => {
    // Mock Verification
    const isValid =
      (data.email.toLowerCase() === MOCK_USER.email || true) &&
      data.agent.trim().toLowerCase() === MOCK_USER.agent.toLowerCase() &&
      (data.dob === MOCK_USER.dob || data.dob === '05/15/1985') &&
      (data.phone === MOCK_USER.phone.replace('+1', '') || data.phone === '5615550100');

    if (isValid) {
      // SUCCESS: Log them in directly
      setForgotVisible(false);
      resetIdentity();
      demoStore.setUser(MOCK_USER); // Log them in
      navigation.reset({ index: 0, routes: [{ name: 'UserLanding' }] });
    } else {
      showAlert('Verification Failed', 'Details do not match our records.', 'error');
    }
  };

  const closeForgot = () => {
    setForgotVisible(false);
    resetIdentity();
  };

  return (
    <ScreenContainer scrollable={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={40} color={COLORS.accent} />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to access your safety dashboard.</Text>
        </View>

        <View style={styles.form}>
          <Controller control={control} name="email" render={({ field, fieldState }) => (
            <AppInput
              label="Email Address"
              placeholder="Enter your email"
              icon="mail-outline"
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          )} />

          <Controller control={control} name="password" render={({ field, fieldState }) => (
            <PasswordInput
              label="Password"
              placeholder="Enter password"
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )} />

          <TouchableOpacity style={styles.forgotBtn} onPress={() => setForgotVisible(true)}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />

          <AppButton
            title="Login"
            onPress={handleSubmit(onLogin)}
            disabled={!formState.isValid}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.link}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* --- FORGOT PASSWORD MODAL --- */}
      <Modal visible={forgotVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>Recover Account</Text>
              <Text style={styles.modalSub}>Verify details to login securely.</Text>

              <Controller control={identityControl} name="email" render={({ field, fieldState }) => (
                <AppInput label="Email" placeholder="Enter email" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
              )} />

              <Controller control={identityControl} name="phone" render={({ field, fieldState }) => (
                <View style={{ marginBottom: 14 }}>
                  <Text style={styles.label}>Phone Number</Text>
                  <PhoneInput
                    value={field.value}
                    onChange={field.onChange}
                    countryCode="+1"
                    placeholder="1234567890"
                    error={fieldState.error?.message}
                  />
                </View>
              )} />

              <Controller control={identityControl} name="agent" render={({ field, fieldState }) => (
                <AppInput label="Agent Name" placeholder="Enter Agent Name" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
              )} />

              <Controller control={identityControl} name="dob" render={({ field, fieldState }) => (
                <DatePickerField label="Date of Birth" value={field.value} onChange={field.onChange} placeholder="MM/DD/YYYY" error={fieldState.error?.message} />
              )} />

              <View style={{ marginTop: 10 }}>
                <AppButton title="Verify & Login" onPress={handleIdentitySubmit(onVerifyIdentity)} disabled={!identityState.isValid} />
                <AppButton title="Cancel" onPress={closeForgot} variant="ghost" />
              </View>
            </ScrollView>

          </View>
        </View>
      </Modal>

      {/* CUSTOM ALERT */}
      <ConfirmationModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
        variant={alertConfig.type === 'success' ? 'primary' : 'danger'}
        confirmText="OK"
        cancelText=""
        onConfirm={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
        onCancel={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', maxWidth: 480, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1A2018', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#2A3028' },
  title: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: COLORS.textSecondary, fontSize: 15, textAlign: 'center' },
  form: { width: '100%' },
  forgotBtn: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { color: COLORS.textSecondary, fontSize: 13 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: COLORS.textSecondary, fontSize: 14 },
  link: { color: COLORS.accent, fontWeight: 'bold', fontSize: 14 },
  label: { color: COLORS.textSecondary, marginBottom: 8, fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: {
    backgroundColor: '#141812', padding: 24, borderRadius: 24, width: '100%', maxWidth: 420,
    borderWidth: 1, borderColor: '#2A3028', maxHeight: '90%'
  },
  modalTitle: { color: COLORS.textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  modalSub: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 20, textAlign: 'center' },
});