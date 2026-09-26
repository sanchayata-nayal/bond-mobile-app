export const CONSENT_VERSION = '2026-09-26';
export const PRIVACY_POLICY_URL = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || '';
export const ACCOUNT_DELETION_URL = process.env.EXPO_PUBLIC_ACCOUNT_DELETION_URL || '';
export const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL || '';
export const BUSINESS_NAME = process.env.EXPO_PUBLIC_BUSINESS_NAME || 'Bond App';

export const CONSENT_TEXT = `Bond App is for adults aged 18 and over. By creating an account, you agree to provide accurate details and confirm that you have permission to provide your emergency contacts' names and phone numbers.

We use your name, email, phone number, date of birth, agent selection or request, and emergency contact details to manage your account and prepare emergency messages. Firebase Authentication manages sign-in; Firebase Firestore stores profiles, consent records, and panic events. Authorized administrators can review these records and assign agents.

Location is optional and requested only when you choose to include it in a panic message while using the app. If allowed, your location and its accuracy are stored with the panic event and included in a message to the emergency recipients configured by the administrator. The message also includes your name, agent, and emergency contact names and phone numbers. You can decline location or revoke permission in device settings. The app does not track location in the background.

The app opens your messaging app so you can review and send the message yourself. Opening the composer does not confirm delivery or that help is on the way. Carrier charges may apply. Bond App is not a replacement for local emergency services and does not guarantee a response.

You can edit your profile or delete your account in My Profile. Account deletion removes your login, profile, consent record, and panic records from the app's active systems. A temporary account identifier may be retained to prevent deleted sessions from recreating data. Messages already sent through your carrier or copied by recipients cannot be recalled by the app. See the Privacy Policy for the operator's contact details, retention and backup practices, and your rights.

By tapping "I Agree & Create Account," you accept these terms and acknowledge the data uses described above. Device location permission is a separate choice when you use the panic feature.`;

export const LOCATION_DISCLOSURE =
  'Include your current location in this panic message? Bond App will store it with the panic event for authorized administrators and add it to the message for configured emergency recipients. Your name, agent, and emergency contact details are also included. Location is used only now, while the app is open. You will still need to send the message in your messaging app.';
