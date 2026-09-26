const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const functionsV1 = require('firebase-functions/v1');
initializeApp();
const db = getFirestore();

async function purgeRecords(uid) {
  // Bounded batches allow accounts with more than 500 events to be deleted.
  while (true) {
    const logs = await db.collection('panic_logs').where('userId', '==', uid).limit(400).get();
    if (logs.empty) break;
    const batch = db.batch();
    logs.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
  await db.recursiveDelete(db.doc(`users/${uid}`));
}

exports.deleteAccount = onCall(
  { region: 'us-central1', timeoutSeconds: 300, maxInstances: 5 },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in first.');
    if (Date.now() / 1000 - request.auth.token.auth_time > 300) {
      throw new HttpsError('failed-precondition', 'Sign in again before deleting an account.');
    }
    const uid = request.data?.uid;
    if (typeof uid !== 'string' || !uid || uid.includes('/') || uid.length > 128) {
      throw new HttpsError('invalid-argument', 'Invalid account.');
    }
    const caller = await db.doc(`users/${request.auth.uid}`).get();
    if (
      uid !== request.auth.uid &&
      (caller.data()?.role !== 'admin' || caller.data()?.deletionPending)
    ) {
      throw new HttpsError('permission-denied', 'Administrator access required.');
    }
    // Prevent new client writes during deletion. Keep this marker on failure for safe retries.
    await db
      .doc(`deletion_locks/${uid}`)
      .set({ expiresAt: Timestamp.fromMillis(Date.now() + 2 * 60 * 60 * 1000) });
    await db.doc(`users/${uid}`).set({ deletionPending: true }, { merge: true });
    await getAuth()
      .revokeRefreshTokens(uid)
      .catch((error) => {
        if (error.code !== 'auth/user-not-found') throw error;
      });
    await getAuth()
      .deleteUser(uid)
      .catch((error) => {
        if (error.code !== 'auth/user-not-found') throw error;
      });
    // The Auth trigger below retries cleanup if this request is interrupted.
    await purgeRecords(uid);
    return { deleted: true };
  },
);

// Also clean up accounts removed directly from Firebase Auth. Enable retries so
// transient failures do not permanently orphan personal data.
exports.cleanupDeletedAccount = functionsV1
  .runWith({ failurePolicy: true, timeoutSeconds: 540 })
  .auth.user()
  .onDelete(async (user) => {
    await db
      .doc(`deletion_locks/${user.uid}`)
      .set({ expiresAt: Timestamp.fromMillis(Date.now() + 2 * 60 * 60 * 1000) });
    await purgeRecords(user.uid);
  });
