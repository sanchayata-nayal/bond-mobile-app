# Google Play release guide

Reviewed against the implementation and official policies on 26 September 2026. Code preparation is complete only to the extent recorded in `VALIDATION.md`; this repository is not a signed or published release. No production Firebase rules/functions or Play Console settings were changed during this work.

## 1. Choose the permanent identity

In [Play Console](https://play.google.com/console), complete all account identity, contact, and device-verification tasks shown on your dashboard. The developer-account fee does not decide whether the app itself is free or paid.

Choose a public app name, the legal business/operator name, a monitored support email, and a permanent Android package ID based on a domain/organization you control (for example, `com.yourcompany.bond`; replace the example). The package ID is embedded in the first uploaded bundle and cannot later be changed for that listing.

Select **All apps → Create app**, language, app name, **App**, and free/paid distribution. This code contains no in-app billing or subscription flow. Complete the policy declarations shown by Google. See [Create and set up your app](https://support.google.com/googleplay/android-developer/answer/9859152?hl=en).

## 2. Publish the required pages

Prepare a public HTTPS privacy policy and an account-deletion request page. Both must work without signing in or installing the app. The privacy policy needs the actual operator/support identity, data uses, recipients, retention periods, backup practices, and deletion process. A generic signup consent dialog does not replace it. Use `PRIVACY_POLICY_DRAFT.md` as a factual starting point and resolve every bracketed item before publication.

The deletion page should identify the app and operator, explain **My Profile → Delete Account**, and offer an actual external request route (for example, a monitored support address and a description of ownership verification and processing times). Explain what is deleted and anything retained. A static page saying only “delete in the app” is insufficient. Do not collect a password through email or a web request form.

Google requires an in-app deletion path **and** an external web resource when accounts can be created in-app: [account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en). Privacy disclosures must match actual practices: [User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en).

## 3. Prepare Firebase before distributing the app

Use a staging Firebase project first. Enable Email/Password Authentication and Firestore. Register a Firebase web app: this Expo app currently uses the Firebase JavaScript SDK, so its public web configuration belongs in the `EXPO_PUBLIC_FIREBASE_*` variables in `.env.example`. Do not package an Admin SDK service-account key. Existing local configuration was preserved in ignored `.env.local`.

1. Use Node 22 LTS and Java 21+ for the emulator. Run `npm ci`, `npm test`, `npm run typecheck`, and `npm run test:rules`.
2. Enable an appropriate Firebase billing plan for Cloud Functions and configure budget alerts. Run `npm ci --prefix functions`.
3. Sign in with the Firebase CLI: `npx firebase login`. Verify the intended project ID in the Firebase console.
4. Deploy to **staging first**: `npx firebase deploy --project YOUR_STAGING_PROJECT_ID --only firestore:rules,functions`. This is a real backend change; review the rules before applying them to an existing live app. Old app versions without normalized contact fields need an upgrade before editing profiles under these rules.
5. Enable a Firestore TTL policy for collection group `deletion_locks`, field `expiresAt`. Locks expire after two hours; Firestore TTL cleanup is asynchronous. They contain only the UID in the document path and an expiry, and prevent old tokens from recreating deleted profiles. Monitor TTL cleanup and function retries.
6. Create the first administrator through normal signup, then set only the intended profile's `role` to `admin` using the Firebase Console or a trusted Admin SDK script. Client apps cannot grant admin rights. Existing trusted admin profiles continue to work. Limit console IAM access and require MFA for console administrators.
7. In Firebase Authentication settings, enforce a minimum password length of 12 for new passwords, allow passphrases, and enable email-enumeration protection. Existing accounts can still log in using their existing password. Client validation alone cannot enforce Firebase's password policy.
8. Configure actual agents and emergency recipient numbers. The agent directory is intentionally readable before signup and must contain directory fields only. All signed-in active users can read the configured emergency routing numbers because the device opens the SMS composer directly.
9. Exercise signup, login, password reset, admin assignment, profile editing, panic with/without location, and account deletion in staging. Verify deletion removes Firebase Auth, `users/{uid}`, and all `panic_logs` with that `userId`. Verify authorization failures and retry cleanup. The callable deletion endpoint requires a recent password confirmation; a retrying Auth-deletion trigger cleans up interrupted requests and console deletions. Do not bulk-delete Auth users with an API that skips individual deletion triggers.
10. Review historical data: old panic logs without `userId`, exports, backups, sent SMS, and any external copies require an explicit retention/deletion process. The code cannot identify legacy records safely by a non-unique name. Resolve these before claiming complete historical deletion.

Repeat the reviewed deployment/configuration for production only after staging checks pass. This task added the backend code but did not deploy it.

## 4. Configure Expo/EAS

Create or use an Expo account, then from this folder run:

```powershell
npx eas-cli login
npx eas-cli init
```

Copy the resulting project UUID to `EAS_PROJECT_ID`. Because `app.config.js` is dynamic, do not rely on EAS automatically editing it. Fill the variables from `.env.example` in `.env.local` for local work and in **EAS project → Environment variables → production** for cloud builds. `EXPO_PUBLIC_*` values ship inside the application and are public. Keep private credentials in the EAS credential service, never in these variables.

Set `APP_ANDROID_PACKAGE`, `APP_DISPLAY_NAME`, business/support details, policy/deletion URLs, Firebase configuration, and `EAS_PROJECT_ID`. The production profile deliberately rejects missing values. Check URLs are live and accurate; syntactic validation does not verify their contents. Set `APP_IOS_BUNDLE_IDENTIFIER` separately if building iOS.

Run:

```powershell
npx expo-doctor
npx expo install --check
npm run typecheck
npm test
npm run test:rules
npx eas-cli build --platform android --profile production
```

Allow EAS to manage a new Android signing key if you do not already have one. Preserve access to that account and key. The production build produces an **AAB**. The preview profile produces an installable APK for device testing. `eas.json` uses remote versioning and increments the Android version code for later uploads.

The project explicitly targets API 36. Google currently requires Android 16 / API 36 for new mobile apps and updates: [target API policy](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en-gb). The final native bundle must also pass [16 KB page-size compatibility](https://developer.android.com/guide/practices/page-sizes); a JavaScript bundle build does not verify native library alignment. Check the AAB in Play Console and test a 16 KB Android environment.

## 5. Complete the listing and declarations

Upload the first AAB manually through **Testing → Internal testing → Create release**. Enable Play App Signing when prompted. Add test users, publish the internal test, and install using the opt-in link. Subsequent uploads can use EAS Submit after a Play service account is deliberately configured.

Complete the app dashboard tasks, using `STORE_DECLARATIONS.md` as the code-based inventory:

- Store listing: title, short/full description, app icon, feature graphic, phone screenshots, category and support contact. Inspect the existing icon/splash assets before treating them as final branding.
- App access: provide working reviewer credentials and precise instructions for the agent flow. Use dedicated review accounts and controlled recipient numbers; never real emergency numbers.
- Privacy-policy and account-deletion URLs.
- Data safety: disclose the profile, contact, location and activity data actually collected; review SDK behavior and the user-initiated sharing exceptions before answering “shared.”
- Ads: none are implemented in this code; confirm there are no off-repository SDK additions.
- Target audience: signup currently requires age 18+. Choose audience and content-rating answers honestly from the product's full content and use.
- Any additional declarations shown for the selected app category, jurisdictions, or permissions. The code requests foreground location only and opens system SMS/dialer interfaces; it does not request restricted SMS/call-log access or background location.

Do not describe the app as guaranteed protection, automatic emergency dispatch, automatic SMS delivery, or background monitoring. It opens a message for the user to send and offers a separate call action. Network, permissions, GPS, carrier delivery and recipient response can all fail.

## 6. Test and request production access

On physical Android devices test small screens/large fonts, keyboard scrolling, all signup fields, DOB selection, collapsed-contact validation, agent overlay, duplicates after profile edits, gesture navigation and bottom spacing, location denial/permanent denial/GPS failure, missing recipients, cancelled SMS, offline behavior, and deletion. Inspect Play's pre-launch report and crashes/ANRs.

For personal developer accounts created after 13 November 2023, Google requires at least **12 testers continuously opted into a closed test for 14 days** before applying for production access. Internal testing alone does not satisfy this. See [testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en).

After completing the required test and dashboard tasks, apply for production access when prompted. Then create a production release, select countries, review every declaration, and submit for Google review. Store approval is not guaranteed by these code changes.

## iOS follow-up

The consent, deletion and foreground permission work supports iOS preparation, but the iOS binary and privacy manifest aggregation must still be tested and inspected in Xcode/TestFlight. Complete App Privacy labels and required-reason API declarations from the actual shipped SDKs; do not invent reasons. The config declares standard exempt encryption only; reassess if custom cryptography is added.

Apple guideline 5.1.5 restricts location APIs used to provide emergency services. This app's panic/location positioning needs a product and App Review assessment; a disclaimer alone does not establish acceptability. In-app account deletion and an accessible privacy policy are also required. See [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).
