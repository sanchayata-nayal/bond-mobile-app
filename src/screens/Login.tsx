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
import ConfirmationModal from '../components/ConfirmationModal';
import { useForm, Controller } from 'react-hook-form';
import { firebaseStore } from '../services/firebaseStore';
import { sessionStore } from '../services/sessionStore';
import { COLORS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { EMAIL_ERROR, EMAIL_REGEX } from '../utils/validation';

/* ---------- SCHEMAS ---------- */
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
const PASSWORD_ERROR = 'Min 6 chars, letters & numbers required';
const emailRule = (requiredMessage: string) =>
  yup
    .string()
    .trim()
    .lowercase()
    .required(requiredMessage)
    .matches(EMAIL_REGEX, { message: EMAIL_ERROR, excludeEmptyString: true });

const loginSchema = yup
  .object({
    email: emailRule('Email required'),
    password: yup.string().required('Password required').matches(PASSWORD_REGEX, PASSWORD_ERROR),
  })
  .required();

const forgotIdentitySchema = yup
  .object({
    email: emailRule('Required'),
  })
  .required();

export default function Login({ navigation }: any) {
  /* --- LOGIN FORM --- */
  const { control, handleSubmit, formState } = useForm({
    defaultValues: { email: '', password: '' },
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
  });

  /* --- STATE --- */
  const [forgotVisible, setForgotVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });
  /* --- FORGOT FORMS --- */
  const {
    control: identityControl,
    handleSubmit: handleIdentitySubmit,
    formState: identityState,
    reset: resetIdentity,
  } = useForm({
    defaultValues: { email: '' },
    resolver: yupResolver(forgotIdentitySchema),
    mode: 'onChange',
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error') => {
    setAlertConfig({ visible: true, title, message, type });
  };

  /* --- HANDLERS --- */
  const onLogin = async (data: any) => {
    setIsLoading(true);
    try {
      // 1. Authenticate with Firebase
      const userProfile = await firebaseStore.loginUser(data.email, data.password);

      // 2. Update local session
      sessionStore.setUser(userProfile);

      // 3. Navigate based on Firestore role
      navigation.reset({
        index: 0,
        routes: [{ name: userProfile.role === 'admin' ? 'AdminLanding' : 'UserLanding' }],
      });
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes('auth/invalid-credential')) msg = 'Invalid email or password.';
      if (msg.includes('auth/user-not-found')) msg = 'User not found.';
      if (msg.includes('auth/wrong-password')) msg = 'Incorrect password.';
      showAlert('Login Failed', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyIdentity = async (data: any) => {
    try {
      await firebaseStore.sendPasswordReset(data.email);
      closeForgot();
      showAlert(
        'Reset Email Sent',
        'If an account exists for that email, a password reset link has been sent.',
        'success',
      );
    } catch (error: any) {
      showAlert('Reset Failed', error.message || 'Could not send password reset email.', 'error');
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
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
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
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <PasswordInput
                label="Password"
                placeholder="Enter password"
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
            title={isLoading ? 'Logging in...' : 'Login'}
            onPress={handleSubmit(onLogin)}
            disabled={!formState.isValid || isLoading}
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
            <ScrollView
              style={{ width: '100%' }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.modalTitle}>Reset Password</Text>
              <Text style={styles.modalSub}>
                Enter your account email and we will send a secure password reset link.
              </Text>

              <Controller
                control={identityControl}
                name="email"
                render={({ field, fieldState }) => (
                  <AppInput
                    label="Email"
                    placeholder="Enter email"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                )}
              />

              <View style={{ marginTop: 10 }}>
                <AppButton
                  title="Send Reset Link"
                  onPress={handleIdentitySubmit(onVerifyIdentity)}
                  disabled={!identityState.isValid}
                />
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
        onConfirm={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        onCancel={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', maxWidth: 480, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A2018',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A3028',
  },
  title: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: COLORS.textSecondary, fontSize: 15, textAlign: 'center' },
  form: { width: '100%' },
  forgotBtn: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { color: COLORS.textSecondary, fontSize: 13 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: COLORS.textSecondary, fontSize: 14 },
  link: { color: COLORS.accent, fontWeight: 'bold', fontSize: 14 },
  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#141812',
    padding: 24,
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: '#2A3028',
    maxHeight: '90%',
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSub: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 20, textAlign: 'center' },

});
