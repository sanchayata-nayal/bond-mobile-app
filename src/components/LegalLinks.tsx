import React from 'react';
import { Alert, Linking, Text, TouchableOpacity, View } from 'react-native';
import { PRIVACY_POLICY_URL, ACCOUNT_DELETION_URL, SUPPORT_EMAIL } from '../config/legal';
import { COLORS } from '../styles/theme';

export default function LegalLinks() {
  const links = [
    { label: 'Privacy Policy', url: PRIVACY_POLICY_URL },
    { label: 'Account deletion information', url: ACCOUNT_DELETION_URL },
    { label: 'Contact support', url: SUPPORT_EMAIL ? `mailto:${SUPPORT_EMAIL}` : '' },
  ];
  return (
    <View style={{ marginVertical: 12 }}>
      {links
        .filter((link) => link.url)
        .map((link) => (
          <TouchableOpacity
            key={link.label}
            accessibilityRole="link"
            style={{ paddingVertical: 12 }}
            onPress={() =>
              Linking.openURL(link.url).catch(() =>
                Alert.alert('Link unavailable', 'Please try again later.'),
              )
            }
          >
            <Text style={{ color: COLORS.accent, textAlign: 'center' }}>{link.label}</Text>
          </TouchableOpacity>
        ))}
    </View>
  );
}
