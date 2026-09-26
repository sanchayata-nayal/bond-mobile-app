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
  ScrollView,
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import AppInput from '../components/AppInput';
import PasswordInput from '../components/PasswordInput';
import AgentSelect from '../components/AgentSelect';
import DatePickerField from '../components/DatePickerField';
import AppButton from '../components/AppButton';
import Collapsible from '../components/Collapsible';
import PhoneInput from '../components/PhoneInput';
import { useForm, Controller, FieldErrors } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { firebaseStore } from '../services/firebaseStore';
import { sessionStore } from '../services/sessionStore';
import { COLORS, LAYOUT } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import {
  AGENT_NOT_LISTED_LABEL,
  AGENT_NOT_LISTED_VALUE,
  PENDING_AGENT_NAME,
} from '../utils/agents';
import { registrationSchema } from '../utils/registrationSchema';
import { CONSENT_TEXT, CONSENT_VERSION } from '../config/legal';
import LegalLinks from '../components/LegalLinks';

/* PhoneField Helper */
const PhoneField = ({ controlName, label, control, error }: any) => (
  <View style={{ marginBottom: 2 }}>
    {label && <Text style={styles.label}>{label}</Text>}
    <Controller
      control={control}
      name={controlName}
      render={({ field }) => (
        <PhoneInput
          value={field.value}
          onChange={field.onChange}
          countryCode="+1"
          placeholder="5551234567"
          error={error}
        />
      )}
    />
  </View>
);

export default function SignUp({ navigation }: any) {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView | null>(null);
  const contentRef = useRef<View>(null);
  const fieldRefs = useRef<Record<string, View | null>>({});
  const pendingField = useRef<string | null>(null);
  const headingAnim = useRef(new Animated.Value(0)).current;
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agentNames, setAgentNames] = useState<string[]>([]);
  const [contactOpen, setContactOpen] = useState({ ec1: true, ec2: false, ec3: false });

  const [formData, setFormData] = useState<any>(null);
  const agentOptions = [...agentNames, AGENT_NOT_LISTED_VALUE];

  const isTabletOrWeb = width > 600;
  const formWidth = isTabletOrWeb ? 500 : '100%';
  const measureAndScroll = (name: string) => {
    const field = fieldRefs.current[name];
    const content = contentRef.current;
    if (!field || !content) return;
    field.measureLayout(
      content,
      (_x, y) => {
        scrollRef.current?.scrollTo({ y: Math.max(y - 24, 0), animated: true });
        pendingField.current = null;
      },
      () => {},
    );
  };
  const registerField = (name: string) => ({
    collapsable: false,
    ref: (view: View | null) => {
      fieldRefs.current[name] = view;
    },
    onLayout: () => {
      if (pendingField.current === name) measureAndScroll(name);
    },
  });

  useEffect(() => {
    Animated.timing(headingAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    let mounted = true;
    firebaseStore
      .fetchAgentNames()
      .then((names) => {
        if (mounted) setAgentNames(names);
      })
      .catch(() => {
        if (mounted) setAgentNames([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const { control, handleSubmit, formState, setValue, watch } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      dob: '',
      phone: '',
      password: '',
      agent: '',
      requestedAgentName: '',
      ec1Name: '',
      ec1Phone: '',
      ec2Name: '',
      ec2Phone: '',
      ec3Name: '',
      ec3Phone: '',
    },
    resolver: yupResolver(registrationSchema),
    mode: 'onChange',
  });
  const selectedAgent = watch('agent');

  const fieldOrder = [
    'firstName',
    'lastName',
    'email',
    'dob',
    'phone',
    'agent',
    'requestedAgentName',
    'password',
    'ec1Name',
    'ec1Phone',
    'ec2Name',
    'ec2Phone',
    'ec3Name',
    'ec3Phone',
  ];

  const openContactForField = (fieldName: string) => {
    if (fieldName.startsWith('ec1')) setContactOpen((current) => ({ ...current, ec1: true }));
    if (fieldName.startsWith('ec2')) setContactOpen((current) => ({ ...current, ec2: true }));
    if (fieldName.startsWith('ec3')) setContactOpen((current) => ({ ...current, ec3: true }));
  };

  const scrollToField = (fieldName: string) => {
    pendingField.current = fieldName;
    openContactForField(fieldName);
    requestAnimationFrame(() => measureAndScroll(fieldName));
  };

  const onInvalidSubmit = (errors: FieldErrors) => {
    const firstInvalid = fieldOrder.find((fieldName) => !!errors[fieldName]);
    if (firstInvalid) scrollToField(firstInvalid);
  };

  const onPreSubmit = (data: any) => {
    setFormData(data);
    setShowDisclaimer(true);
  };

  const onConsent = async () => {
    if (!formData || isLoading) return;
    setIsLoading(true);

    // Capture consent timestamp
    const timestamp = new Date().toISOString();
    const isAgentMissing = formData.agent === AGENT_NOT_LISTED_VALUE;
    const requestedAgentName = isAgentMissing ? formData.requestedAgentName.trim() : '';
    const agent = isAgentMissing ? PENDING_AGENT_NAME : formData.agent;

    try {
      // 1. Create User in Firebase (Uses formData.email and formData.password)
      const newUser = await firebaseStore.registerUser({
        ...formData,
        agent,
        requestedAgentName,
        agentStatus: isAgentMissing ? 'pending' : 'assigned',
        phone: `+1${formData.phone}`,
        ec1Phone: `+1${formData.ec1Phone}`,
        ec2Phone: `+1${formData.ec2Phone}`,
        ec3Phone: `+1${formData.ec3Phone}`,
        // Legal Evidence
        consentText: CONSENT_TEXT,
        consentTimestamp: timestamp,
        consentVersion: CONSENT_VERSION,
      });

      // 2. Update local session
      sessionStore.setUser(newUser);

      // 3. Navigate
      setShowDisclaimer(false);
      setFormData(null);
      navigation.reset({ index: 0, routes: [{ name: 'UserLanding' }] });
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes('email-already-in-use')) msg = 'This email is already registered.';
      Alert.alert('Registration Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable={false} style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.pageScroll}
          contentContainerStyle={styles.pageScrollContent}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          showsVerticalScrollIndicator
        >
          <View
            ref={contentRef}
            collapsable={false}
            style={{ width: '100%', alignItems: 'center' }}
          >
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: headingAnim,
                  transform: [
                    {
                      translateY: headingAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <View>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Please fill in all required fields.</Text>
              </View>
            </Animated.View>

            <View style={[styles.card, { width: formWidth }]}>
              <Text style={styles.sectionTitle}>Personal Details</Text>

              {/* Name Row */}
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }} {...registerField('firstName')}>
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field, fieldState }) => (
                      <AppInput
                        label="First Name"
                        placeholder="Jane"
                        value={field.value}
                        onChangeText={field.onChange}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </View>
                <View style={{ flex: 1 }} {...registerField('lastName')}>
                  <Controller
                    control={control}
                    name="lastName"
                    render={({ field, fieldState }) => (
                      <AppInput
                        label="Last Name"
                        placeholder="Doe"
                        value={field.value}
                        onChangeText={field.onChange}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </View>
              </View>

              {/* Email Field (Added) */}
              <View {...registerField('email')}>
                <Controller
                  control={control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <AppInput
                      label="Email Address"
                      placeholder="jane@example.com"
                      value={field.value}
                      onChangeText={field.onChange}
                      error={fieldState.error?.message}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  )}
                />
              </View>

              <View {...registerField('dob')}>
                <Controller
                  control={control}
                  name="dob"
                  render={({ field, fieldState }) => (
                    <DatePickerField
                      label="Date of Birth"
                      value={field.value}
                      onChange={(v) => setValue('dob', v, { shouldValidate: true })}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </View>

              <View {...registerField('phone')}>
                <PhoneField
                  controlName="phone"
                  label="Phone Number"
                  control={control}
                  error={formState.errors.phone?.message}
                />
              </View>

              <View style={styles.agentField} {...registerField('agent')}>
                <Controller
                  control={control}
                  name="agent"
                  render={({ field, fieldState }) => (
                    <AgentSelect
                      label="Agent Name"
                      placeholder="Select assigned agent"
                      value={field.value}
                      onChange={field.onChange}
                      options={agentOptions}
                      optionLabels={{ [AGENT_NOT_LISTED_VALUE]: AGENT_NOT_LISTED_LABEL }}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </View>

              {selectedAgent === AGENT_NOT_LISTED_VALUE && (
                <View {...registerField('requestedAgentName')}>
                  <Controller
                    control={control}
                    name="requestedAgentName"
                    render={({ field, fieldState }) => (
                      <AppInput
                        label="Requested Agent Name"
                        placeholder="Enter agent name"
                        value={field.value}
                        onChangeText={field.onChange}
                        error={fieldState.error?.message}
                        autoCapitalize="words"
                      />
                    )}
                  />
                  <Text style={styles.fieldHint}>
                    This request is stored on your profile and shown to admins under Agent
                    Management.
                  </Text>
                </View>
              )}

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Security</Text>
              <View {...registerField('password')}>
                <Controller
                  control={control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <PasswordInput
                      label="Password"
                      placeholder="At least 12 characters"
                      value={field.value}
                      onChangeText={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </View>

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Emergency Contacts</Text>
              <Text style={styles.sectionSub}>3 contacts are required for maximum safety.</Text>

              <Collapsible
                title="Contact 1 (Required)"
                open={contactOpen.ec1}
                onOpenChange={(open) => setContactOpen((current) => ({ ...current, ec1: open }))}
              >
                <View {...registerField('ec1Name')}>
                  <Controller
                    control={control}
                    name="ec1Name"
                    render={({ field, fieldState }) => (
                      <AppInput
                        label="Full Name"
                        placeholder="Name"
                        value={field.value}
                        onChangeText={field.onChange}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </View>
                <View {...registerField('ec1Phone')}>
                  <PhoneField
                    controlName="ec1Phone"
                    label="Phone"
                    control={control}
                    error={formState.errors.ec1Phone?.message}
                  />
                </View>
              </Collapsible>

              <Collapsible
                title="Contact 2 (Required)"
                open={contactOpen.ec2}
                onOpenChange={(open) => setContactOpen((current) => ({ ...current, ec2: open }))}
              >
                <View {...registerField('ec2Name')}>
                  <Controller
                    control={control}
                    name="ec2Name"
                    render={({ field, fieldState }) => (
                      <AppInput
                        label="Full Name"
                        placeholder="Name"
                        value={field.value}
                        onChangeText={field.onChange}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </View>
                <View {...registerField('ec2Phone')}>
                  <PhoneField
                    controlName="ec2Phone"
                    label="Phone"
                    control={control}
                    error={formState.errors.ec2Phone?.message}
                  />
                </View>
              </Collapsible>

              <Collapsible
                title="Contact 3 (Required)"
                open={contactOpen.ec3}
                onOpenChange={(open) => setContactOpen((current) => ({ ...current, ec3: open }))}
              >
                <View {...registerField('ec3Name')}>
                  <Controller
                    control={control}
                    name="ec3Name"
                    render={({ field, fieldState }) => (
                      <AppInput
                        label="Full Name"
                        placeholder="Name"
                        value={field.value}
                        onChangeText={field.onChange}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </View>
                <View {...registerField('ec3Phone')}>
                  <PhoneField
                    controlName="ec3Phone"
                    label="Phone"
                    control={control}
                    error={formState.errors.ec3Phone?.message}
                  />
                </View>
              </Collapsible>

              <View style={{ height: 20 }} />

              <AppButton
                title="Create Account"
                onPress={handleSubmit(onPreSubmit, onInvalidSubmit)}
              />

              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={{ padding: 12, alignItems: 'center' }}
              >
                <Text style={{ color: COLORS.textSecondary }}>
                  Already have an account?{' '}
                  <Text style={{ color: COLORS.accent, fontWeight: 'bold' }}>Login</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSpacer} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Disclaimer Modal */}
      <Modal
        visible={showDisclaimer}
        transparent
        animationType="fade"
        onRequestClose={() => !isLoading && setShowDisclaimer(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <Ionicons name="document-text-outline" size={40} color={COLORS.accent} />
                <Text style={styles.modalTitle}>Terms & Data Consent</Text>
              </View>

              <Text style={styles.modalText}>{CONSENT_TEXT}</Text>
              <LegalLinks />

              <View style={{ height: 20 }} />

              <AppButton
                title={isLoading ? 'Registering...' : 'I Agree & Create Account'}
                onPress={onConsent}
                disabled={isLoading}
              />
              <AppButton
                title="Cancel"
                onPress={() => {
                  setShowDisclaimer(false);
                  setFormData(null);
                }}
                variant="ghost"
                disabled={isLoading}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

/*Styles*/
const styles = StyleSheet.create({
  screen: {
    padding: 0,
    width: '100%',
    minHeight: 0,
    ...(Platform.OS === 'web'
      ? ({ height: '100vh', maxHeight: '100vh', overflow: 'hidden' } as any)
      : {}),
  },
  keyboardView: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    ...(Platform.OS === 'web' ? ({ height: '100%', maxHeight: '100%' } as any) : {}),
  },
  pageScroll: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    ...(Platform.OS === 'web'
      ? ({ height: '100%', maxHeight: '100%', overflowY: 'auto' } as any)
      : {}),
  },
  pageScrollContent: {
    alignItems: 'center',
    paddingHorizontal: LAYOUT.pagePadding,
    paddingTop: LAYOUT.pagePadding,
    paddingBottom: 64,
  },
  bottomSpacer: { height: 40 },
  header: {
    width: '100%',
    marginBottom: 20,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  agentField: { zIndex: 6000 },
  fieldHint: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: -6,
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionSub: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 12, marginTop: -6 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  divider: { height: 1, backgroundColor: '#1F241D', marginVertical: 16 },

  label: { color: COLORS.textSecondary, marginBottom: 8, fontSize: 13 },

  /* Modal */
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
    borderRadius: 20,
    width: '100%',
    maxWidth: 480,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#2A3028',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  modalText: {
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
    fontSize: 14,
    textAlign: 'justify',
  },
});
