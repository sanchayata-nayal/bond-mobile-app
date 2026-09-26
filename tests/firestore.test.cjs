const { test, before, after, beforeEach } = require('node:test');
const { readFileSync } = require('node:fs');
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require('@firebase/rules-unit-testing');
const {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  writeBatch,
  increment,
} = require('firebase/firestore');
let env;
const profile = (uid) => ({
  uid,
  email: `${uid}@example.com`,
  firstName: 'Jane',
  lastName: 'Doe',
  phone: '+12025550100',
  dob: '01/01/1990',
  agent: 'Agent',
  requestedAgentName: '',
  agentStatus: 'assigned',
  role: 'user',
  joinedAt: new Date().toISOString(),
  panicCount: 0,
  consentGiven: true,
  consentTimestamp: new Date().toISOString(),
  consentText: 'Consent',
  consentVersion: '2026-09-26',
  emergencyContacts: [1, 2, 3].map((i) => ({
    name: `Contact ${i}`,
    nameKey: `contact${i}`,
    phone: `+1202555010${i}`,
  })),
});
const userDb = (uid = 'alice') =>
  env.authenticatedContext(uid, { email: `${uid}@example.com` }).firestore();
before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-bond',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});
after(async () => env?.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'users/alice'), profile('alice'));
    await setDoc(doc(db, 'users/bob'), profile('bob'));
    await setDoc(doc(db, 'users/admin'), { ...profile('admin'), role: 'admin' });
    await setDoc(doc(db, 'agents/one'), { name: 'Agent', active: true });
  });
});
test('directory is public but profiles and routing are private', async () => {
  const db = env.unauthenticatedContext().firestore();
  await assertSucceeds(getDocs(collection(db, 'agents')));
  await assertFails(getDoc(doc(db, 'users/alice')));
  await assertFails(getDoc(doc(db, 'config/global')));
});
test('users cannot read other profiles, list users, grant admin, alter consent, or delete profiles', async () => {
  const db = userDb();
  await assertSucceeds(getDoc(doc(db, 'users/alice')));
  await assertFails(getDoc(doc(db, 'users/bob')));
  await assertFails(getDocs(collection(db, 'users')));
  await assertFails(updateDoc(doc(db, 'users/alice'), { role: 'admin' }));
  await assertFails(updateDoc(doc(db, 'users/alice'), { consentGiven: false }));
  await assertFails(deleteDoc(doc(db, 'users/alice')));
});
test('registration works but forged admin, email, and duplicate contacts fail', async () => {
  const db = userDb('new');
  await assertFails(setDoc(doc(db, 'users/new'), { ...profile('new'), role: 'admin' }));
  await assertFails(setDoc(doc(db, 'users/new'), { ...profile('new'), email: 'bob@example.com' }));
  const duplicate = profile('new');
  duplicate.emergencyContacts[2] = duplicate.emergencyContacts[0];
  await assertFails(setDoc(doc(db, 'users/new'), duplicate));
  await assertSucceeds(setDoc(doc(db, 'users/new'), profile('new')));
});
test('profile contact validation checks actual canonical names and phone numbers', async () => {
  const db = userDb();
  const cs = profile('alice').emergencyContacts;
  cs[1] = { ...cs[1], name: 'CONTACT 1', nameKey: 'contact1' };
  await assertFails(updateDoc(doc(db, 'users/alice'), { emergencyContacts: cs }));
  cs[1].nameKey = 'forged';
  await assertFails(updateDoc(doc(db, 'users/alice'), { emergencyContacts: cs }));
  await assertSucceeds(updateDoc(doc(db, 'users/alice'), { firstName: 'Updated' }));
});
test('admin can manage agents and assignments, ordinary users cannot', async () => {
  await assertFails(setDoc(doc(userDb(), 'agents/two'), { name: 'Agent Two' }));
  await assertSucceeds(
    setDoc(doc(userDb('admin'), 'agents/two'), { name: 'Agent Two', active: true }),
  );
  await assertSucceeds(
    updateDoc(doc(userDb('admin'), 'users/alice'), {
      agent: 'Agent Two',
      agentStatus: 'assigned',
      requestedAgentName: '',
    }),
  );
  await assertSucceeds(getDocs(collection(userDb('admin'), 'users')));
});
test('panic batch works for own account and cannot impersonate another account', async () => {
  const db = userDb();
  const log = {
    userId: 'alice',
    userName: 'Jane Doe',
    userPhone: '+12025550100',
    agent: 'Agent',
    timestamp: new Date().toISOString(),
    location: 'Not shared',
  };
  const batch = writeBatch(db);
  batch.set(doc(db, 'panic_logs/one'), log);
  batch.update(doc(db, 'users/alice'), {
    panicCount: increment(1),
    lastPanicAt: new Date().toISOString(),
  });
  await assertSucceeds(batch.commit());
  await assertFails(setDoc(doc(db, 'panic_logs/two'), { ...log, userId: 'bob' }));
});
test('deletion lock prevents writes and recreation using an unexpired token', async () => {
  await env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'deletion_locks/alice'), { expiresAt: new Date() });
  });
  await assertFails(updateDoc(doc(userDb(), 'users/alice'), { firstName: 'Changed' }));
  await env.withSecurityRulesDisabled((context) =>
    deleteDoc(doc(context.firestore(), 'users/alice')),
  );
  await assertFails(setDoc(doc(userDb(), 'users/alice'), profile('alice')));
});
