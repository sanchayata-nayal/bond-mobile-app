import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Starting from '../screens/Starting';
import SignUp from '../screens/SignUp';
import Login from '../screens/Login';
import UserLanding from '../screens/UserLanding';
import UserDetails from '../screens/UserDetails';

const Stack = createStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator initialRouteName="Starting" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Starting" component={Starting} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="UserLanding" component={UserLanding} />
      <Stack.Screen name="UserDetails" component={UserDetails} />
    </Stack.Navigator>
  );
}