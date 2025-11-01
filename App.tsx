// Bond App - Expo React Native Starter (App.tsx)
// Minimal working version for UI demo (Starting, Signup, User Landing)
// Steps:
// 1. Run: npm install -g expo-cli
// 2. Create project: expo init bond-app --template expo-template-blank-typescript
// 3. cd bond-app && npm install @react-navigation/native @react-navigation/stack react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-screens
// 4. Replace this file with App.tsx
// 5. Add `bond_logo.jpg` inside /assets
// 6. Run with: npx expo start

import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, ScrollView, SafeAreaView, Dimensions } from 'react-native';

const Stack = createStackNavigator();
const { width } = Dimensions.get('window');

const COLORS = {
  background: '#0F150D',
  accent: '#BBC633',
  panic: '#D32F2F',
  textPrimary: '#FFFFFF',
  textSecondary: '#BFC7AC',
};

function StartingScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.centerContent}>
        <Image source={require('./assets/bond_logo.jpg')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Bond</Text>
        <Text style={styles.subtitle}>Employee safety, simplified.</Text>

        <TouchableOpacity style={[styles.button, { backgroundColor: COLORS.accent }]} onPress={() => navigation.navigate('SignUp')}>
          <Text style={[styles.buttonText, { color: COLORS.background }]}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { borderColor: COLORS.accent, borderWidth: 1 }]} onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.buttonText, { color: COLORS.accent }]}>Login</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Bond Safety Solutions</Text>
          <Text style={styles.footerText}>123 Business St, City, Country</Text>
          <Text style={styles.footerText}>Phone: +1 561 XXX XXXX</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SignUpScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.h1}>Create Account</Text>
        <TextInput style={styles.input} placeholder="First Name" placeholderTextColor="#7A7A7A" />
        <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor="#7A7A7A" />
        <TextInput style={styles.input} placeholder="Date of Birth" placeholderTextColor="#7A7A7A" />
        <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#7A7A7A" />
        <TextInput style={styles.input} placeholder="Agent Name" placeholderTextColor="#7A7A7A" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#7A7A7A" secureTextEntry />
        <TouchableOpacity style={[styles.button, { backgroundColor: COLORS.accent }]} onPress={() => navigation.navigate('UserLanding')}>
          <Text style={[styles.buttonText, { color: COLORS.background }]}>Create Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function UserLandingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.h1}>Welcome</Text>
        <Text style={styles.subtitle}>Tap the Panic button when you need assistance</Text>
        <TouchableOpacity style={styles.panicButton}>
          <Text style={styles.panicText}>PANIC</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function LoginScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.h1}>Login</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: COLORS.accent }]} onPress={() => navigation.navigate('SignUp')}>
          <Text style={[styles.buttonText, { color: COLORS.background }]}>Go to Sign Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Starting" component={StartingScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="UserLanding" component={UserLandingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: COLORS.textPrimary, fontSize: 36, fontWeight: '700', marginTop: 8 },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center' },
  logo: { width: Math.min(220, width * 0.6), height: Math.min(120, width * 0.33), marginBottom: 12 },
  button: { width: '80%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  buttonText: { fontWeight: '600', fontSize: 16 },
  footer: { marginTop: 40, alignItems: 'center' },
  footerText: { color: COLORS.textSecondary, fontSize: 12 },
  h1: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '700', marginBottom: 12 },
  formContainer: { padding: 20 },
  input: { backgroundColor: '#141414', color: COLORS.textPrimary, padding: 12, borderRadius: 8, marginBottom: 12, width: '100%' },
  panicButton: { width: 200, height: 200, borderRadius: 999, backgroundColor: COLORS.panic, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  panicText: { color: '#fff', fontSize: 28, fontWeight: '800' },
});
