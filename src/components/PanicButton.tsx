// src/components/PanicButton.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { COLORS } from '../styles/theme';

type Props = {
  onPress: () => void;
  disabled?: boolean;
};

export default function PanicButton({ onPress, disabled }: Props) {
  // Animation values
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.3)).current;
  const rippleScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (disabled) return;

    // Breathing loop
    const breathe = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.0, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(rippleScale, { toValue: 1.4, duration: 3000, useNativeDriver: true }),
          Animated.timing(rippleScale, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 3000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.3, duration: 0, useNativeDriver: true }),
        ])
      ])
    );
    
    breathe.start();
    return () => breathe.stop();
  }, [disabled]);

  return (
    <View style={styles.container}>
      {/* Outer Ripple Ring */}
      {!disabled && (
        <Animated.View
          style={[
            styles.ripple,
            {
              transform: [{ scale: rippleScale }],
              opacity: opacity,
            },
          ]}
        />
      )}

      {/* Main Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled}
        style={styles.touchable}
      >
        <Animated.View style={[styles.button, { transform: [{ scale }] }]}>
          <Text style={styles.text}>PANIC</Text>
          <Text style={styles.subText}>TAP FOR HELP</Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const BUTTON_SIZE = 240;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: BUTTON_SIZE + 60, // extra space for ripple
    height: BUTTON_SIZE + 60,
  },
  ripple: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: COLORS.panic,
    zIndex: 0,
  },
  touchable: {
    zIndex: 1,
    // Native shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0 15px 35px rgba(214, 69, 69, 0.4)',
      } as any,
    }),
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: COLORS.panic,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 1,
  },
});