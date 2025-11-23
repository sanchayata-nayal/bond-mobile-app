// src/screens/Login.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import AppInput from '../components/AppInput';
import PasswordInput from '../components/PasswordInput';
import AppButton from '../components/AppButton';
import { useForm, Controller } from 'react-hook-form';
import { demoStore } from '../services/demoStore';
import { COLORS, LAYOUT } from '../styles/theme';
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
  emergencyContacts: [
    { name: 'Jane Doe', phone: '+15615550199' },
    { name: 'Bob Smith', phone: '+15615550188' },
    { name: 'Alice Wonderland', phone: '+15615550177' },
  ],
};

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email required'),
  password: yup.string().required('Password required'),
}).required();

export default function Login({ navigation }: any) {
  const { control, handleSubmit, formState } = useForm({
    defaultValues: { email: '', password: '' },
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: any) => {
    // SIMULATED LOGIN CHECK
    if (data.email.toLowerCase() === 'demo@bond.com' && data.password === 'bond123') {
      // 1. Load Mock Data
      demoStore.setUser(MOCK_USER);
      
      // 2. Navigate to Dashboard
      navigation.reset({ index: 0, routes: [{ name: 'UserLanding' }] });
    } else {
      Alert.alert('Login Failed', 'Invalid email or password.\n\nTry:\ndemo@bond.com\nbond123');
    }
  };

  return (
    <ScreenContainer scrollable={false}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.container}
      >
        
        {/* Logo / Header Area */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={40} color={COLORS.accent} />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to access your safety dashboard.</Text>
        </View>

        {/* Form Area */}
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

          <TouchableOpacity style={styles.forgotBtn} onPress={() => Alert.alert('Reset Password', 'This feature is coming soon.')}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />

          <AppButton 
            title="Login" 
            onPress={handleSubmit(onSubmit)} 
            disabled={!formState.isValid}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.link}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dev Helper Hint (Remove in Production) */}
        <View style={styles.devHint}>
          <Text style={styles.devText}>Test User: demo@bond.com / bond123</Text>
        </View>

      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 480, // Constrain width on tablets/web
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A2018', // Subtle circle background
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A3028',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  link: {
    color: COLORS.accent,
    fontWeight: 'bold',
    fontSize: 14,
  },
  devHint: {
    marginTop: 40,
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
  },
  devText: {
    color: '#555',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  }
});