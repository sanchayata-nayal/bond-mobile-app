# Store declaration inventory

This is an implementation inventory, not a submitted declaration. Confirm Firebase console settings, third-party processing, backups, retention, and any other systems before answering store questionnaires. Google guidance: [Data safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en).

| Data | Current flow | Purpose / choice |
| --- | --- | --- |
| Name, email, phone, date of birth | Firebase Auth/profile in Firestore; visible to authorized admins | Required account/profile data. Review necessity of DOB beyond adult eligibility before launch. |
| User ID | Firebase Auth UID, profile, panic records; temporary deletion lock | Account management, authorization, deletion protection. |
| Agent selection / requested name | `users/{uid}.agent`, `requestedAgentName`, `agentStatus` | Account routing/admin review. Pending requests appear in Admin → Agent Management. Admin assignment clears the pending request name. |
| Emergency contacts | Three manually entered names and +1 phone numbers, normalized uniqueness fields | Required by current form. No device address-book access. Included in outgoing panic message drafts. |
| Approximate/precise location and accuracy | Collected only after explicit panic/location choice and OS permission; stored in panic log; included in SMS draft | Optional, foreground only. Denial or GPS failure still permits a message without location. Not background tracking. |
| Panic activity/time/count | Firestore panic event and profile count | App functionality and admin reporting. User-triggered client events, not a verified dispatch or delivery audit. |
| Consent text/version/time | Profile | Record of the signup terms accepted. Separate from OS location permission. |
| Password | Sent to Firebase Authentication | Not written into the Firestore profile. Never log or export passwords. |

Firestore is the app's backend; data sent there is collected, not merely processed ephemerally. Firebase's role as a service provider and transfers initiated by the user need assessment under the store's definitions of sharing. Location and contact details leave the app when the user sends the SMS; recipients/carriers may retain copies. Do not answer “no data collected.”

No ads, cross-app tracking, analytics SDK, photo uploads, camera/microphone access, device contacts access, background location, direct SMS permission or call-log permission are implemented in the source reviewed here. SDK/network diagnostic behavior still requires review of the shipped build. Do not claim “no diagnostics” without that review.

Transport: Firebase SDK calls use HTTPS; Android cleartext traffic is disabled. SMS has carrier security characteristics and is not end-to-end encrypted by this app. Do not describe all onward sharing as encrypted just because Firebase uses HTTPS.

Deletion: reauthenticated callable function removes Auth and active app records, with a retrying Auth trigger for cleanup. A short-lived UID/expiry lock protects against old sessions; enable TTL. Historical logs lacking user IDs, administrator exports, backups and messages already sent need separate operational treatment and disclosure. No arbitrary legal retention period has been invented.

Permissions: generated Android manifest and iOS Info.plist must be reviewed after native build. Location explanations are configured; background location, contacts, SMS/call-log, camera/microphone, storage and overlay permissions are blocked on Android. Account deletion and public policy links must be verified on the released build, not just in source.
