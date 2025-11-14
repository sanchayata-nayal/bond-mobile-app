import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import LottiePlayer from '../components/LottiePlayer';
import { COLORS, LAYOUT } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

// load your exported Lottie JSON here
const radarAnimation = require('../../assets/animations/sonar_logo.json');

export default function Starting({ navigation }: any) {
  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.container}>
        <View style={styles.topBlock}>
          <Text style={styles.headline}>Get Started</Text>
          <Text style={styles.sub}>Help — when you need it.</Text>
        </View>

        <View style={styles.lottieWrap}>
          {/* The Lottie contains the entire radar (logo, sweep, dots). Loop forever. */}
          <LottiePlayer
            source={radarAnimation}
            loop={true}
            autoPlay={true}
            speed={1} // adjust to make sweep faster/slower
            style={styles.lottie}
          />
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={styles.loginBtn}
            activeOpacity={0.86}
            onPress={() => navigation.navigate('Login')}
          >
            <Ionicons name="log-in-outline" size={18} color={COLORS.textPrimary} />
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signUpBtn}
            activeOpacity={0.92}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.signUpBtnText}>Sign up</Text>
            <Ionicons name="arrow-forward" size={18} color={'#0F150D'} style={{ marginLeft: 12 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>All State Bail Bond Services</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

/* ===== styles ===== */
const LOTTIE_SIZE = 360;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: LAYOUT.maxWidth,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
  },

  topBlock: {
    width: '100%',
    alignItems: 'flex-start',
    paddingTop: 6,
  },
  headline: { color: COLORS.textPrimary, fontSize: 26, fontWeight: '800', marginBottom: 6 },
  sub: { color: COLORS.textSecondary, fontSize: 13.5, maxWidth: 520 },

  lottieWrap: {
    width: LOTTIE_SIZE,
    height: LOTTIE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  lottie: {
    width: LOTTIE_SIZE,
    height: LOTTIE_SIZE,
  },

  buttonsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  loginBtn: {
    flex: 1,
    height: LAYOUT.controlHeight,
    borderRadius: 999,
    borderWidth: 1.6,
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(255,255,255,0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 18,
    marginRight: 8,
  },
  loginBtnText: { color: COLORS.textPrimary, fontWeight: '700', marginLeft: 12 },

  signUpBtn: {
    flex: 1,
    height: LAYOUT.controlHeight,
    borderRadius: 999,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginLeft: 8,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 12px 30px rgba(11,12,11,0.30)' } as any)
      : { shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, elevation: 3 }),
  },
  signUpBtnText: { color: '#0F150D', fontWeight: '800' },

  footer: { paddingTop: 6 },
  footerText: { color: COLORS.textSecondary, fontSize: 12 },
});
