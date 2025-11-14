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
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import AppInput from '../components/AppInput';
import PasswordInput from '../components/PasswordInput';
import Collapsible from '../components/Collapsible';
import AppButton from '../components/AppButton';
import DatePickerField from '../components/DatePickerField';
import PhoneInput from '../components/PhoneInput';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { demoStore } from '../services/demoStore';
import { COLORS, LAYOUT } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

/* ---------- Helpers: parse/age ---------- */
const parseDateFromString = (str: string) => {
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const d = parseInt(parts[0], 10),
    m = parseInt(parts[1], 10) - 1,
    y = parseInt(parts[2], 10);
  const dt = new Date(y, m, d);
  return isNaN(dt.getTime()) ? null : dt;
};

/* ---------- Validation schema (keeps your rules) ---------- */
const schema = yup
  .object({
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
  })
  .required();

/* ---------- Component ---------- */
export default function SignUp({ navigation }: any) {
  const [countryCode, setCountryCode] = useState('+1'); // default USA
  const headingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headingAnim, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, []);

  const { control, handleSubmit, formState, setValue, watch } = useForm({
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

  const watchAll = watch(); // optionally used for live UI

  const onSubmit = (data: any) => {
    // Save user securely (demoStore) and redirect
    demoStore.setUser({
      id: Math.random().toString(36).slice(2, 9),
      firstName: data.firstName,
      lastName: data.lastName,
      dob: data.dob,
      phone: `${countryCode}${data.phone}`,
      agent: data.agent,
      emergencyContacts: [
        { name: data.ec1Name, phone: `${countryCode}${data.ec1Phone}` },
        { name: data.ec2Name, phone: `${countryCode}${data.ec2Phone}` },
        { name: data.ec3Name, phone: `${countryCode}${data.ec3Phone}` },
      ],
    });

    // friendly confirm
    Alert.alert('Account created', 'Welcome aboard — your profile is ready.', [
      { text: 'Continue', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'UserLanding' }] }) },
    ]);
  };

  /* small helper to render a country selector (simple) */
  const CountrySelector = () => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        // simple toggle for demo; in prod you can present a modal with full list
        setCountryCode((c) => (c === '+1' ? '+44' : '+1'))
      }
      style={styles.countryBtn}
    >
      <Text style={styles.countryText}>{countryCode}</Text>
      <Ionicons name="chevron-down" size={14} color={COLORS.textSecondary} style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  );

  return (
    <ScreenContainer scrollable={true}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
        <Animated.View
          style={[
            styles.headerWrap,
            {
              opacity: headingAnim,
              transform: [
                {
                  translateY: headingAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.h1}>Register</Text>
          <Text style={styles.h2}>Create an account — it only takes a minute.</Text>
        </Animated.View>

        {/* FORM CARD */}
        <View style={styles.card}>
          {/* names row */}
          <View style={styles.row}>
            <Controller
              control={control}
              name="firstName"
              render={({ field, fieldState }) => (
                <AppInput
                  label="First name"
                  icon="person"
                  {...field}
                  error={fieldState.error?.message}
                  style={styles.halfField}
                  placeholder="John"
                />
              )}
            />

            <Controller
              control={control}
              name="lastName"
              render={({ field, fieldState }) => (
                <AppInput
                  label="Last name"
                  icon="person-outline"
                  {...field}
                  error={fieldState.error?.message}
                  style={styles.halfField}
                  placeholder="Doe"
                />
              )}
            />
          </View>

          {/* DOB + Phone row */}
          <View style={styles.row}>
            <Controller
              control={control}
              name="dob"
              render={({ field, fieldState }) => (
                <DatePickerField
                  label="Date of Birth"
                  value={field.value}
                  onChange={(val: string) => setValue('dob', val, { shouldValidate: true })}
                  error={fieldState.error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field, fieldState }) => (
                <View style={[styles.halfField]}>
                  <Text style={styles.labelSmall}>Phone number</Text>
                  <View style={styles.phoneRow}>
                    <CountrySelector />
                    <PhoneInput
                      placeholder="5551234567"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      countryCode={countryCode}
                    />
                  </View>
                  {fieldState.error?.message ? <Text style={styles.err}>{fieldState.error.message}</Text> : null}
                </View>
              )}
            />
          </View>

          {/* password + agent */}
          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <PasswordInput
                label="Password"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
                placeholder="6-15 chars, at least one number"
              />
            )}
          />

          <Controller
            control={control}
            name="agent"
            render={({ field, fieldState }) => (
              <AppInput label="Agent name" icon="business" {...field} error={fieldState.error?.message} />
            )}
          />

          {/* emergency contacts grouped and collapsible */}
          <View style={{ marginTop: 6 }}>
            <Collapsible title="Emergency Contact 1 (required)" startOpen>
              <Controller
                control={control}
                name="ec1Name"
                render={({ field, fieldState }) => <AppInput label="Name" {...field} error={fieldState.error?.message} />}
              />
              <Controller
                control={control}
                name="ec1Phone"
                render={({ field, fieldState }) => (
                  <PhoneInput placeholder="Phone" value={field.value} onChange={field.onChange} error={fieldState.error?.message} countryCode={countryCode} />
                )}
              />
            </Collapsible>

            <Collapsible title="Emergency Contact 2 (required)">
              <Controller
                control={control}
                name="ec2Name"
                render={({ field, fieldState }) => <AppInput label="Name" {...field} error={fieldState.error?.message} />}
              />
              <Controller
                control={control}
                name="ec2Phone"
                render={({ field, fieldState }) => (
                  <PhoneInput placeholder="Phone" value={field.value} onChange={field.onChange} error={fieldState.error?.message} countryCode={countryCode} />
                )}
              />
            </Collapsible>

            <Collapsible title="Emergency Contact 3 (required)">
              <Controller
                control={control}
                name="ec3Name"
                render={({ field, fieldState }) => <AppInput label="Name" {...field} error={fieldState.error?.message} />}
              />
              <Controller
                control={control}
                name="ec3Phone"
                render={({ field, fieldState }) => (
                  <PhoneInput placeholder="Phone" value={field.value} onChange={field.onChange} error={fieldState.error?.message} countryCode={countryCode} />
                )}
              />
            </Collapsible>
          </View>

          {/* small helper */}
          <Text style={styles.help}>All fields are required. We’ll only use this info for emergency contact & safety.</Text>

          <View style={{ height: 8 }} />
          <AppButton title="Create Account" disabled={!formState.isValid} onPress={handleSubmit(onSubmit)} />
        </View>

        {/* bottom hint */}
        <View style={styles.bottomRow}>
          <Text style={styles.smallText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}> Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  headerWrap: { width: '100%', marginBottom: 12 },
  h1: { color: COLORS.textPrimary, fontSize: 26, fontWeight: '800', marginBottom: 6 },
  h2: { color: COLORS.textSecondary, fontSize: 14 },

  card: {
    width: '100%',
    borderRadius: 14,
    padding: 18,
    backgroundColor: '#0C0E0B',
    // soft shadow (web/native)
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 12px 30px rgba(0,0,0,0.36)' } as any)
      : { shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 16, elevation: 7 }),
    marginVertical: 8,
  },

  row: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  halfField: { flex: 1 },

  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },

  countryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: LAYOUT.controlHeight,
    borderRadius: LAYOUT.borderRadius,
    backgroundColor: '#0A0C09',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  countryText: { color: COLORS.textPrimary, fontWeight: '700' },

  labelSmall: { color: COLORS.textSecondary, marginBottom: 4, fontSize: 13 },

  help: { color: COLORS.textSecondary, fontSize: 12, marginTop: 8 },

  bottomRow: { width: '100%', flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  smallText: { color: COLORS.textSecondary },
  linkText: { color: COLORS.accent, fontWeight: '700' },

  err: { color: COLORS.error, marginTop: 6, fontSize: 12 },
});
