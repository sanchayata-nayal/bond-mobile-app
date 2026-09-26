const base = require('./app.json').expo;

module.exports = () => {
  const production = process.env.EAS_BUILD_PROFILE === 'production';
  const required = [
    'APP_ANDROID_PACKAGE',
    'EXPO_PUBLIC_BUSINESS_NAME',
    'EXPO_PUBLIC_SUPPORT_EMAIL',
    'EXPO_PUBLIC_PRIVACY_POLICY_URL',
    'EXPO_PUBLIC_ACCOUNT_DELETION_URL',
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_FIREBASE_APP_ID',
    'EAS_PROJECT_ID',
  ];
  if (production) {
    const missing = required.filter((key) => !process.env[key]?.trim());
    if (missing.length) throw new Error(`Release configuration missing: ${missing.join(', ')}`);
    for (const key of ['EXPO_PUBLIC_PRIVACY_POLICY_URL', 'EXPO_PUBLIC_ACCOUNT_DELETION_URL']) {
      const url = new URL(process.env[key]);
      if (url.protocol !== 'https:' || /(^|\.)(example\.(com|org)|localhost)$/.test(url.hostname)) {
        throw new Error(`${key} must point to your public HTTPS website.`);
      }
    }
    if (
      !/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){2,}$/.test(process.env.APP_ANDROID_PACKAGE) ||
      process.env.APP_ANDROID_PACKAGE.startsWith('com.example.')
    ) {
      throw new Error('Set APP_ANDROID_PACKAGE to the permanent package ID you own.');
    }
    if (process.env.EAS_BUILD_PLATFORM === 'ios' && !process.env.APP_IOS_BUNDLE_IDENTIFIER) {
      throw new Error('Set APP_IOS_BUNDLE_IDENTIFIER before an iOS release build.');
    }
  }
  return {
    ...base,
    name: process.env.APP_DISPLAY_NAME || 'Bond App',
    ios: {
      ...base.ios,
      ...(process.env.APP_IOS_BUNDLE_IDENTIFIER
        ? { bundleIdentifier: process.env.APP_IOS_BUNDLE_IDENTIFIER }
        : {}),
      infoPlist: { ...base.ios?.infoPlist, ITSAppUsesNonExemptEncryption: false },
    },
    android: {
      ...base.android,
      ...(process.env.APP_ANDROID_PACKAGE ? { package: process.env.APP_ANDROID_PACKAGE } : {}),
      versionCode: 1,
      allowBackup: false,
      permissions: [
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',
      ],
      blockedPermissions: [
        'android.permission.ACCESS_BACKGROUND_LOCATION',
        'android.permission.FOREGROUND_SERVICE_LOCATION',
        'android.permission.READ_CONTACTS',
        'android.permission.WRITE_CONTACTS',
        'android.permission.READ_SMS',
        'android.permission.SEND_SMS',
        'android.permission.RECEIVE_SMS',
        'android.permission.READ_CALL_LOG',
        'android.permission.WRITE_CALL_LOG',
        'android.permission.CALL_PHONE',
        'android.permission.RECORD_AUDIO',
        'android.permission.CAMERA',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.SYSTEM_ALERT_WINDOW',
      ],
    },
    plugins: [
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Bond App uses your location, only when you choose, to include it in a panic message and save the panic event for your administrator.',
          isIosBackgroundLocationEnabled: false,
          isAndroidBackgroundLocationEnabled: false,
          isAndroidForegroundServiceEnabled: false,
        },
      ],
      [
        'expo-build-properties',
        { android: { compileSdkVersion: 36, targetSdkVersion: 36, usesCleartextTraffic: false } },
      ],
    ],
    extra: {
      ...(process.env.EAS_PROJECT_ID ? { eas: { projectId: process.env.EAS_PROJECT_ID } } : {}),
    },
  };
};
