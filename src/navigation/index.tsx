// src/navigation/index.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../styles/theme';

import Starting from '../screens/Starting';
import SignUp from '../screens/SignUp';
import Login from '../screens/Login';
import UserLanding from '../screens/UserLanding';
import UserDetails from '../screens/UserDetails';

// Admin Screens
import AdminLanding from '../screens/AdminLanding';
import AdminRecipients from '../screens/AdminRecipients';
import AdminUsers from '../screens/AdminUsers';
import AdminMetrics from '../screens/AdminMetrics';
const Stack = createStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator 
      initialRouteName="Starting" 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
        headerStyle: { backgroundColor: COLORS.background, shadowColor: 'transparent' },
        headerTintColor: COLORS.textPrimary,
      }}
    >
      {/* Public & User */}
      <Stack.Screen name="Starting" component={Starting} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="UserLanding" component={UserLanding} />
      <Stack.Screen name="UserDetails" component={UserDetails} />

      {/* Admin */}
      <Stack.Screen name="AdminLanding" component={AdminLanding} />
      <Stack.Screen name="AdminRecipients" component={AdminRecipients} />
      <Stack.Screen name="AdminUsers" component={AdminUsers} />
      <Stack.Screen name="AdminMetrics" component={AdminMetrics} />
    </Stack.Navigator>
  );
}