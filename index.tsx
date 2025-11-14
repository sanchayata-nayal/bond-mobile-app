import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import React, { JSX } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppStack from './src/navigation';  // ✅ imports your existing stack
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App(): JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppStack />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Tells Expo: “Start the app using this component”
registerRootComponent(App);

export default App;
