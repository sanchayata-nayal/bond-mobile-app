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
  Linking,
  Alert
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

/* ---------- DUMMY DATA ---------- */
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
  password: yup.string().required('Password required'),
}).required();

const forgotIdentitySchema = yup.object({
  email: yup.string().email('Invalid email').required('Required'),
  phone: yup.string().required('Required').min(10, '10 digits required'),
  dob: yup.string().required('Required'),
  agent: yup.string().required('Required'),
}).required();

// Schema for Step 2 (OTP)
const forgotResetSchema = yup.object({
  otp: yup.string().required('OTP Required').matches(/^[0-9]{6}$/, 'Must be 6 digits'),
  newPassword: yup.string().required('Required').min(6, 'Min 6 characters'),
}).required();

export default function Login({ navigation }: any) {
  // 1. Login Form
  const { control, handleSubmit, formState } = useForm({
    defaultValues: { email: '', password: '' },
    resolver: yupResolver(loginSchema),
  });

  // 2. Forgot Password States
  const [forgotVisible, setForgotVisible] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1); // 1 = Identify, 2 = OTP & New Pass
  
  // Alert State
  const [alertConfig, setAlertConfig] = useState<{visible: boolean, title: string, message: string, type: 'success' | 'error'}>({
    visible: false, title: '', message: '', type: 'error'
  });

  // 3. Forgot Forms (Two separate form instances for two steps)
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
    defaultValues: { otp: '', newPassword: '' },
    resolver: yupResolver(forgotResetSchema),
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error') => {
    setAlertConfig({ visible: true, title, message, type });
  };

  // --- ACTIONS ---

  const onLogin = (data: any) => {
    if (data.email.toLowerCase() === 'demo@bond.com' && data.password === 'bond123') {
      demoStore.setUser(MOCK_USER);
      navigation.reset({ index: 0, routes: [{ name: 'UserLanding' }] });
    } else {
      showAlert('Login Failed', 'Invalid email or password.', 'error');
    }
  };

  const onVerifyIdentity = (data: any) => {
    // Mock verification
    const isValid = 
      (data.email.toLowerCase() === MOCK_USER.email || true) && 
      data.agent === MOCK_USER.agent &&
      (data.dob === MOCK_USER.dob || data.dob === '05/15/1985');

    if (isValid) {
      // Simulate sending email
      const subject = encodeURIComponent("Bond App: Password Reset Code");
      const body = encodeURIComponent(`Your temporary reset code is: 123456`);
      const mailtoUrl = `mailto:${data.email}?subject=${subject}&body=${body}`;
      
      Linking.openURL(mailtoUrl).catch(() => {});
      
      // Advance to Step 2
      setResetStep(2); 
    } else {
      // Keep modal open, show error alert on top
      showAlert('Verification Failed', 'Details do not match our records.', 'error');
    }
  };

  const onFinalizeReset = (data: any) => {
    if (data.otp === '123456') {
      setForgotVisible(false);
      setResetStep(1);
      resetIdentity();
      resetFinal();
      setTimeout(() => {
        showAlert('Success', 'Your password has been updated. Please login.', 'success');
      }, 500);
    } else {
      showAlert('Invalid Code', 'The OTP provided is incorrect.', 'error');
    }
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
            <AppInput label="Email Address" placeholder="Enter your email" icon="mail-outline" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} autoCapitalize="none" keyboardType="email-address" />
          )} />

          <Controller control={control} name="password" render={({ field, fieldState }) => (
            <PasswordInput label="Password" placeholder="Enter your password" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
          )} />

          <TouchableOpacity style={styles.forgotBtn} onPress={() => setForgotVisible(true)}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />

          <AppButton title="Login" onPress={handleSubmit(onLogin)} disabled={!formState.isValid} />

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
            
            {/* STEP 1: IDENTITY */}
            {resetStep === 1 && (
              <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Recover Account</Text>
                <Text style={styles.modalSub}>Enter your details to verify identity.</Text>

                <Controller control={identityControl} name="email" render={({ field }) => (
                  <AppInput label="Email" placeholder="Enter your email" value={field.value} onChangeText={field.onChange} />
                )} />
                
                <Controller control={identityControl} name="phone" render={({ field }) => (
                  <PhoneInput placeholder="Phone Number" value={field.value} onChange={field.onChange} countryCode="+1" />
                )} />

                <Controller control={identityControl} name="agent" render={({ field }) => (
                  <AppInput label="Agent Name" placeholder="Enter Agent Name" value={field.value} onChangeText={field.onChange} />
                )} />

                <Controller control={identityControl} name="dob" render={({ field }) => (
                  <DatePickerField label="Date of Birth" value={field.value} onChange={field.onChange} placeholder="MM/DD/YYYY" />
                )} />

                <View style={{ marginTop: 10 }}>
                  <AppButton title="Verify & Send Code" onPress={handleIdentitySubmit(onVerifyIdentity)} disabled={!identityState.isValid} />
                  <AppButton title="Cancel" onPress={closeForgot} variant="ghost" />
                </View>
              </ScrollView>
            )}

            {/* STEP 2: OTP & RESET */}
            {resetStep === 2 && (
              <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Verification</Text>
                <Text style={styles.modalSub}>Enter the code sent to your email/phone.</Text>

                <Controller control={resetControl} name="otp" render={({ field, fieldState }) => (
                  <AppInput 
                    label="Verification Code" 
                    placeholder="123456" 
                    value={field.value} 
                    onChangeText={field.onChange} 
                    keyboardType="number-pad"
                    maxLength={6}
                    error={fieldState.error?.message}
                  />
                )} />

                <Controller control={resetControl} name="newPassword" render={({ field, fieldState }) => (
                  <PasswordInput 
                    label="New Password" 
                    placeholder="Enter new password" 
                    value={field.value} 
                    onChangeText={field.onChange} 
                    error={fieldState.error?.message}
                  />
                )} />

                <View style={{ marginTop: 10 }}>
                  <AppButton title="Reset Password" onPress={handleResetSubmit(onFinalizeReset)} disabled={!resetState.isValid} />
                  <AppButton title="Back" onPress={() => setResetStep(1)} variant="ghost" />
                </View>
              </ScrollView>
            )}

          </View>
        </View>
      </Modal>

      {/* --- CUSTOM ALERT (Single or Double Button) --- */}
      <ConfirmationModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
        variant={alertConfig.type === 'success' ? 'primary' : 'danger'}
        confirmText="OK"
        cancelText="" // Hides the second button
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
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { 
    backgroundColor: '#141812', padding: 24, borderRadius: 24, width: '100%', maxWidth: 420, 
    borderWidth: 1, borderColor: '#2A3028', maxHeight: '90%' 
  },
  modalTitle: { color: COLORS.textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  modalSub: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 20, textAlign: 'center' },
});