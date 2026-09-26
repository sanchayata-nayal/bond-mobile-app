# Change and validation record

## Changes

- Login input icon spacing increased, with accessible field labels.
- Separate browser DOB calendar; native picker avoids opening the keyboard and validates its initial date.
- Agent picker uses a dismissible overlay rather than taking form space.
- Signup submit stays enabled; invalid fields show red messages and scroll using coordinates relative to the full form. Collapsed invalid emergency contacts open first.
- Signup and profile edits share validation. Contact names are compared without case/whitespace and phone numbers are normalized. The service and Firestore rules also reject duplicates. Uniqueness is within each user's three contacts, not globally across users.
- Requested agents remain stored in `users/{uid}.requestedAgentName`, with `agentStatus: pending`; admins see Pending Requests in Agent Management and the user profile/list. Assignment clears the pending request.
- Consent text stays justified, now explains the actual Firebase/SMS/location/deletion flows and records a version. Configurable privacy/deletion/support links are available at signup and in the profile.
- Panic shadow is on the opaque circular button. Dashboard can scroll on short screens; shared safe-area handling and bottom padding protect actions from system navigation.
- New passwords require 12+ characters and accept passphrases/symbols. Existing login passwords remain usable. Firebase server password policy still needs matching configuration.
- Account deletion now uses a reauthenticated backend callable and an Auth cleanup trigger, instead of deleting only a Firestore profile. Requires backend deployment before use.
- Firestore rules restrict profile access and admin writes, protect roles/consent, validate contacts, prevent log impersonation, and block deleted-session recreation.
- Panic location choice is separate from registration. GPS or database delays do not indefinitely block opening a message. The user sends SMS and explicitly chooses to call; cancelled/unknown delivery is not presented as confirmed help.
- Release config targets API 36, disables Android cleartext traffic/backups, blocks unused sensitive permissions, and refuses missing production configuration.
- Removed the unused legacy phone-input package; updated compatible dependencies and aligned native packages with Expo SDK 54.

## Verification performed

Before the user requested no more app runs:

- TypeScript checking passed.
- Web export succeeded; no native release binary was built.
- Six schema/config/contact tests passed.
- Seven Firestore emulator test groups passed: public directory/private records, owner isolation, admin/consent tampering denial, valid/invalid registration, duplicate/forged contact data, admin agent management, own panic batch/impersonation denial, and deletion-lock protection. Some groups cover multiple cases.
- Browser inspection confirmed required-field messages, scrolling back to the first invalid field, an agent overlay, and the web calendar opening. No test account was registered and no panic message was sent.

At the user's request, the preview server and temporary tabs were stopped. No further application runs or runtime tests were performed. Later cleanup, accessibility, timeout and dependency changes received static review only. A final static-check command had been started before the user's instruction to run nothing further, but its completion result could not be retrieved; final-state type checking is therefore unconfirmed. Earlier successful builds/tests are not proof of the final native release.

## Remaining release gates

- Firebase rules/functions deployment and end-to-end Auth/Firestore deletion must be tested in staging. The callable/trigger code has syntax checks; its cloud execution and retry behavior have not been verified by this task.
- Supply permanent package identity, EAS project, legal business/support details, and real public privacy/deletion pages. The policy draft has unresolved business facts and must not be published as-is.
- Configure Firebase password policy, enumeration protection, deletion-lock TTL, IAM/MFA and operational retention. App Check with native attestation and abuse/rate controls should be evaluated as a separate integration; they are not claimed as implemented.
- Final dependency scan: app tree has 13 advisory entries (11 moderate, 2 high; zero critical). High entries are `image-size` and `postcss` in the Expo build tooling dependency chain. Backend has 8 moderate entries, no high/critical. See `DEPENDENCY_AUDIT.json`. These are package advisory counts, not a claim of 21 independently exploitable app flaws. Remaining fixes include major SDK/Admin SDK migrations or dependency overrides requiring compatibility validation. Do not use `npm audit fix --force` blindly. Resolve or formally assess these findings before production release.
- Native Android/iOS picker behavior, physical-device layout, SMS/location flows, final manifest/PrivacyInfo aggregation, signed AAB, 16 KB page sizes, Play pre-launch report and store approval remain unverified.
- Apple emergency/location positioning needs specific review against guideline 5.1.5.

No production service, Play Console declaration, signed release, or store submission was changed.
