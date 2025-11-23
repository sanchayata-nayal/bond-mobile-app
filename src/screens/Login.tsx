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
  ScrollView
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import AppInput from '../components/AppInput';
import PasswordInput from '../components/PasswordInput';
import AppButton from '../components/AppButton';
import DatePickerField from '../components/DatePickerField'; // Reused for verification
import ConfirmationModal from '../components/ConfirmationModal'; // Reused for alerts
import { useForm, Controller } from 'react-hook-form';
import { demoStore } from '../services/demoStore';
import { COLORS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

/* ---------- DUMMY DATA FOR TESTING ---------- */
const MOCK_USER = {
  id: 'test-user-001',
  firstName: 'John',
  lastName: 'Doe',
  dob: '05/15/1985',
  phone: '+15615550100',
  agent: 'Agent Smith',
  email: 'demo@bond.com', // Added for verification matching
  emergencyContacts: [
    { name: 'Jane Doe', phone: '+15615550199' },
    { name: 'Bob Smith', phone: '+15615550188' },
    { name: 'Alice Wonderland', phone: '+15615550177' },
  ],
};

const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email required'),
  password: yup.string().required('Password required'),
}).required();

const forgotSchema = yup.object({
  email: yup.string().email().required('Required'),
  phone: yup.string().required('Required'),
  dob: yup.string().required('Required'),
  agent: yup.string().required('Required'),
}).required();

export default function Login({ navigation }: any) {
  // Login Form
  const { control, handleSubmit, formState } = useForm({
    defaultValues: { email: '', password: '' },
    resolver: yupResolver(loginSchema),
  });

  // Forgot Password Form
  const { 
    control: forgotControl, 
    handleSubmit: handleForgotSubmit, 
    formState: forgotFormState,
    reset: resetForgot
  } = useForm({
    defaultValues: { email: '', phone: '', dob: '', agent: '' },
    resolver: yupResolver(forgotSchema),
  });

  const [forgotVisible, setForgotVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{visible: boolean, title: string, message: string, type: 'success' | 'error'}>({
    visible: false, title: '', message: '', type: 'error'
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error') => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const onLogin = (data: any) => {
    if (data.email.toLowerCase() === 'demo@bond.com' && data.password === 'bond123') {
      demoStore.setUser(MOCK_USER);
      navigation.reset({ index: 0, routes: [{ name: 'UserLanding' }] });
    } else {
      showAlert('Login Failed', 'Invalid email or password.', 'error');
    }
  };

  const onResetPassword = (data: any) => {
    // Simulated Cross-Check Verification
    const isValid = 
      data.email.toLowerCase() === MOCK_USER.email &&
      data.phone === MOCK_USER.phone.replace('+1', '') && // Assume user types w/o +1
      data.agent === MOCK_USER.agent &&
      // Simple DOB check (string match)
      (data.dob === MOCK_USER.dob || data.dob === '05/15/1985'); 

    if (isValid) {
      setForgotVisible(false);
      resetForgot();
      showAlert('Identity Verified', 'A password reset link has been sent to your email.', 'success');
    } else {
      // Show error inside the modal context or main alert
      // Here we close and show alert for simplicity, or you could add inline error state
      setForgotVisible(false);
      setTimeout(() => {
        showAlert('Verification Failed', 'The details provided do not match our records.', 'error');
      }, 300);
    }
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
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <AppInput
                label="Email Address"
                placeholder="name@example.com"
                icon="mail-outline"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

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

      {/* FORGOT PASSWORD MODAL */}
      <Modal visible={forgotVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalSub}>Verify your identity to continue.</Text>
            
            <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
              <Controller control={forgotControl} name="email" render={({ field }) => (
                <AppInput label="Email" placeholder="demo@bond.com" value={field.value} onChangeText={field.onChange} />
              )} />
              
              <Controller control={forgotControl} name="phone" render={({ field }) => (
                <AppInput label="Phone (10 digits)" placeholder="5615550100" keyboardType="number-pad" value={field.value} onChangeText={field.onChange} />
              )} />

              <Controller control={forgotControl} name="agent" render={({ field }) => (
                <AppInput label="Agent Name" placeholder="Agent Smith" value={field.value} onChangeText={field.onChange} />
              )} />

              <Controller control={forgotControl} name="dob" render={({ field }) => (
                <DatePickerField label="Date of Birth" value={field.value} onChange={field.onChange} placeholder="MM/DD/YYYY" />
              )} />

              <View style={{ marginTop: 10 }}>
                <AppButton title="Verify & Reset" onPress={handleForgotSubmit(onResetPassword)} disabled={!forgotFormState.isValid} />
                <AppButton title="Cancel" onPress={() => setForgotVisible(false)} variant="ghost" />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CUSTOM ALERT MODAL (Success/Error) */}
      <ConfirmationModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
        variant={alertConfig.type === 'success' ? 'primary' : 'danger'}
        confirmText="OK"
        cancelText="" // Hide cancel button for single-action alerts
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
  
  /* Forgot Password Modal Styles */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { 
    backgroundColor: '#141812', padding: 24, borderRadius: 24, width: '100%', maxWidth: 420, 
    borderWidth: 1, borderColor: '#2A3028', maxHeight: '90%' 
  },
  modalTitle: { color: COLORS.textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  modalSub: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 20, textAlign: 'center' },
});