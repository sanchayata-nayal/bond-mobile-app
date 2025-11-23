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
const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email required'),
  password: yup.string().required('Password required').min(6, 'Min 6 characters'),
}).required();

const forgotIdentitySchema = yup.object({
  email: yup.string().email('Invalid email').required('Required'),
  phone: yup.string().required('Required').min(10, '10 digits required'),
  dob: yup.string().required('Required'),
  agent: yup.string().required('Required'),
}).required();

// New Schema: No OTP, just New Password
const forgotResetSchema = yup.object({
  newPassword: yup.string().required('Required').min(6, 'Min 6 characters'),
  confirmPassword: yup.string()
    .required('Required')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
}).required();

export default function Login({ navigation }: any) {
  /* --- LOGIN STATE --- */
  const { control, handleSubmit, formState } = useForm({
    defaultValues: { email: '', password: '' },
    resolver: yupResolver(loginSchema),
    mode: 'onChange'
  });

  /* --- FORGOT PASSWORD STATE --- */
  const [forgotVisible, setForgotVisible] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1); // 1 = Verify, 2 = Reset
  
  /* --- ALERT STATE --- */
  const [alertConfig, setAlertConfig] = useState<{visible: boolean, title: string, message: string, type: 'success' | 'error'}>({
    visible: false, title: '', message: '', type: 'error'
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error') => {
    setAlertConfig({ visible: true, title, message, type });
  };

  /* --- FORMS --- */
  const { 
    control: identityControl, 
    handleSubmit: handleIdentitySubmit, 
    formState: identityState,
    reset: resetIdentity
  } = useForm({
    defaultValues: { email: '', phone: '', dob: '', agent: '' },
    resolver: yupResolver(forgotIdentitySchema),
  });

  const { 
    control: resetControl, 
    handleSubmit: handleResetSubmit, 
    formState: resetState,
    reset: resetFinal
  } = useForm({
    defaultValues: { newPassword: '', confirmPassword: '' },
    resolver: yupResolver(forgotResetSchema),
  });

  /* --- HANDLERS --- */
  const onLogin = (data: any) => {
    if (data.email.toLowerCase() === 'demo@bond.com' && data.password === 'bond123') {
      demoStore.setUser(MOCK_USER);
      navigation.reset({ index: 0, routes: [{ name: 'UserLanding' }] });
    } else {
      showAlert('Login Failed', 'Invalid email or password.', 'error');
    }
  };

  const onVerifyIdentity = (data: any) => {
    // Case Insensitive Check for Agent & Email
    const isValid = 
      (data.email.toLowerCase() === MOCK_USER.email || true) && // Allow test emails for now
      data.agent.toLowerCase() === MOCK_USER.agent.toLowerCase() &&
      (data.dob === MOCK_USER.dob || data.dob === '05/15/1985');

    if (isValid) {
      // Direct to Step 2
      setResetStep(2);
    } else {
      showAlert('Verification Failed', 'The details provided do not match our records.', 'error');
    }
  };

  const onFinalizeReset = (data: any) => {
    // Here you would update the password in backend
    setForgotVisible(false);
    setResetStep(1);
    resetIdentity();
    resetFinal();
    setTimeout(() => {
      showAlert('Success', 'Your password has been updated. You can now login.', 'success');
    }, 500);
  };

  const closeForgot = () => {
    setForgotVisible(false);
    setResetStep(1);
    resetIdentity();
    resetFinal();
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
              placeholder="Enter your password" 
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
            
            {resetStep === 1 ? (
              /* STEP 1: VERIFY */
              <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Recover Account</Text>
                <Text style={styles.modalSub}>Enter your details to verify identity.</Text>

                <Controller control={identityControl} name="email" render={({ field, fieldState }) => (
                  <AppInput label="Email" placeholder="Enter email" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
                )} />
                
                <Controller control={identityControl} name="phone" render={({ field, fieldState }) => (
                  <View style={{ marginBottom: 14 }}>
                    <Text style={styles.label}>Phone Number</Text>
                    <PhoneInput value={field.value} onChange={field.onChange} countryCode="+1" placeholder="1234567890" error={fieldState.error?.message} />
                  </View>
                )} />

                <Controller control={identityControl} name="agent" render={({ field, fieldState }) => (
                  <AppInput label="Agent Name" placeholder="Agent Smith" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
                )} />

                <Controller control={identityControl} name="dob" render={({ field, fieldState }) => (
                  <DatePickerField label="Date of Birth" value={field.value} onChange={field.onChange} placeholder="MM/DD/YYYY" error={fieldState.error?.message} />
                )} />

                <View style={{ marginTop: 10 }}>
                  <AppButton title="Verify Identity" onPress={handleIdentitySubmit(onVerifyIdentity)} disabled={!identityState.isValid} />
                  <AppButton title="Cancel" onPress={closeForgot} variant="ghost" />
                </View>
              </ScrollView>
            ) : (
              /* STEP 2: RESET */
              <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Set New Password</Text>
                <Text style={styles.modalSub}>Identity verified. Create a new password.</Text>

                <Controller control={resetControl} name="newPassword" render={({ field, fieldState }) => (
                  <PasswordInput 
                    label="New Password" 
                    placeholder="Min 6 chars" 
                    value={field.value} 
                    onChangeText={field.onChange} 
                    error={fieldState.error?.message}
                  />
                )} />

                <Controller control={resetControl} name="confirmPassword" render={({ field, fieldState }) => (
                  <PasswordInput 
                    label="Confirm Password" 
                    placeholder="Re-enter password" 
                    value={field.value} 
                    onChangeText={field.onChange} 
                    error={fieldState.error?.message}
                  />
                )} />

                <View style={{ marginTop: 10 }}>
                  <AppButton title="Update Password" onPress={handleResetSubmit(onFinalizeReset)} disabled={!resetState.isValid} />
                  <AppButton title="Cancel" onPress={closeForgot} variant="ghost" />
                </View>
              </ScrollView>
            )}

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
        cancelText="" // Single button
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