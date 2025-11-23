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

/* ---------- Validation Logic ---------- */
const parseDate = (str: string) => {
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const m = parseInt(parts[0], 10);
  const d = parseInt(parts[1], 10);
  const y = parseInt(parts[2], 10);
  
  // Basic sanity checks
  if (m < 1 || m > 12) return null;
  if (d < 1 || d > 31) return null;
  if (y < 1900 || y > new Date().getFullYear()) return null;

  const date = new Date(y, m - 1, d);
  // check if date is valid (e.g. not 31st of Feb)
  if (date.getFullYear() !== y || date.getMonth() + 1 !== m || date.getDate() !== d) {
    return null;
  }
  return date;
};

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string(), // Optional now
  dob: yup
    .string()
    .required('Date of birth required')
    .matches(/^\d{2}\/\d{2}\/\d{4}$/, 'Format: MM/DD/YYYY')
    .test('is-valid-date', 'Invalid date or month', (val) => !!(val && parseDate(val)))
    .test('is-18', 'Must be at least 18 years old', (val) => {
      if (!val) return false;
      const date = parseDate(val);
      if (!date) return false;
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      const m = today.getMonth() - date.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
        return (age - 1) >= 18;
      }
      return age >= 18;
    }),
  phone: yup.string().required('Phone required').matches(/^\d{10}$/, 'Must be exactly 10 digits'),
  password: yup
    .string()
    .required('Password required')
    .min(6, 'Min 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, 'Must contain letters and numbers'),
  agent: yup.string().required('Agent name required'),
  
  // 3 Mandatory Emergency Contacts
  ec1Name: yup.string().required('Contact 1 name required'),
  ec1Phone: yup.string().required('Contact 1 phone required').matches(/^\d{10}$/, 'Must be 10 digits'),
  
  ec2Name: yup.string().required('Contact 2 name required'),
  ec2Phone: yup.string().required('Contact 2 phone required').matches(/^\d{10}$/, 'Must be 10 digits'),
  
  ec3Name: yup.string().required('Contact 3 name required'),
  ec3Phone: yup.string().required('Contact 3 phone required').matches(/^\d{10}$/, 'Must be 10 digits'),
}).required();

export default function SignUp({ navigation }: any) {
  const { width } = useWindowDimensions();
  const headingAnim = useRef(new Animated.Value(0)).current;
  const [showDisclaimer, setShowDisclaimer] = useState(false);

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
    mode: 'onChange', // Triggers validation while typing
  });

  const onSubmit = (data: any) => {
    demoStore.setUser({
      id: Math.random().toString(36).slice(2, 9),
      firstName: data.firstName,
      lastName: data.lastName || '',
      dob: data.dob,
      phone: `+1${data.phone}`,
      agent: data.agent,
      emergencyContacts: [
        { name: data.ec1Name, phone: `+1${data.ec1Phone}` },
        { name: data.ec2Name, phone: `+1${data.ec2Phone}` },
        { name: data.ec3Name, phone: `+1${data.ec3Phone}` },
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

  // Reusable Phone Row Component
  const PhoneField = ({ controlName, label, control, error }: any) => (
    <View style={{ marginBottom: 14 }}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.phoneRow}>
        <CountryPill />
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name={controlName}
            render={({ field }) => (
              <AppInput
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="phone-pad"
                placeholder="5551234567"
                style={{ marginBottom: 0 }}
                // We pass error to AppInput to color the border red
                error={null} 
              />
            )}
          />
        </View>
      </View>
      {/* Render error outside because AppInput inside row is tight */}
      {error && <Text style={styles.errText}>{error}</Text>}
    </View>
  );

  return (
    <ScreenContainer scrollable>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%', alignItems: 'center' }}>
        
        <Animated.View style={[styles.header, { opacity: headingAnim, transform: [{ translateY: headingAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Please fill in all required fields.</Text>
          </View>
        </Animated.View>

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
                <AppInput label="Last Name (Optional)" placeholder="Doe" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
              )} />
            </View>
          </View>

          <Controller control={control} name="dob" render={({ field, fieldState }) => (
            <DatePickerField 
              label="Date of Birth" 
              value={field.value} 
              onChange={(v) => setValue('dob', v, { shouldValidate: true })} 
              error={fieldState.error?.message} 
            />
          )} />

          <PhoneField 
            controlName="phone" 
            label="Phone Number" 
            control={control} 
            error={formState.errors.phone?.message} 
          />

          <Controller control={control} name="agent" render={({ field, fieldState }) => (
            <AppInput label="Agent Name" icon="business-outline" placeholder="Assigned Agent" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
          )} />

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Security</Text>
          <Controller control={control} name="password" render={({ field, fieldState }) => (
            <PasswordInput label="Password" placeholder="Min 6 chars, alphanumeric" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
          )} />

          <View style={styles.divider} />

          {/* Emergency Contacts - All 3 Required */}
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <Text style={styles.sectionSub}>3 contacts are required for maximum safety.</Text>

          <Collapsible title="Contact 1 (Required)" startOpen>
            <Controller control={control} name="ec1Name" render={({ field, fieldState }) => (
              <AppInput label="Full Name" placeholder="Name" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
            )} />
            <PhoneField controlName="ec1Phone" label="Phone" control={control} error={formState.errors.ec1Phone?.message} />
          </Collapsible>

          <Collapsible title="Contact 2 (Required)">
            <Controller control={control} name="ec2Name" render={({ field, fieldState }) => (
              <AppInput label="Full Name" placeholder="Name" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
            )} />
            <PhoneField controlName="ec2Phone" label="Phone" control={control} error={formState.errors.ec2Phone?.message} />
          </Collapsible>

          <Collapsible title="Contact 3 (Required)">
            <Controller control={control} name="ec3Name" render={({ field, fieldState }) => (
              <AppInput label="Full Name" placeholder="Name" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
            )} />
            <PhoneField controlName="ec3Phone" label="Phone" control={control} error={formState.errors.ec3Phone?.message} />
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
    backgroundColor: '#0C0E0B', 
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
  errText: { color: COLORS.error, marginTop: 6, fontSize: 12 },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#141812', padding: 24, borderRadius: 20, width: '100%', maxWidth: 400, alignItems: 'center', borderWidth: 1, borderColor: '#2A3028' },
  modalTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  modalText: { color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalActions: { flexDirection: 'row', width: '100%' }
});