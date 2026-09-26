// src/services/firebaseStore.ts
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  DocumentData,
  writeBatch,
  increment,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  where,
  limit,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { normalizeContacts } from '../utils/contacts';
import { registrationSchema, profileSchema } from '../utils/registrationSchema';
import { PENDING_AGENT_NAME } from '../utils/agents';

/* --- TYPES --- */
export type EmergencyContact = { name: string; phone: string };

export type UserProfile = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dob: string;
  agent: string;
  requestedAgentName?: string;
  agentStatus?: 'assigned' | 'pending';
  emergencyContacts: EmergencyContact[];
  role: 'user' | 'admin';
  joinedAt: string; // ISO Date
  panicCount: number;
  // Legal Consent Fields
  consentGiven: boolean;
  consentTimestamp: string;
  consentText: string;
  consentVersion: string;
};

export type AppUser = UserProfile & {
  id: string;
  joinedDate?: string;
};

export type Recipient = {
  id: string;
  name: string;
  phone: string;
};

export type Agent = {
  id: string;
  name: string;
  normalizedName?: string;
  active?: boolean;
  createdAt?: string;
};

export type PanicLog = {
  id: string;
  userId?: string;
  userName: string;
  userPhone: string;
  agent: string;
  timestamp: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
};

const nowIso = () => new Date().toISOString();

const normalizeAgentName = (name: string) => name.trim().toLowerCase();

const uniqueNames = (names: Array<string | undefined>) =>
  Array.from(new Set(names.map((name) => name?.trim()).filter(Boolean))) as string[];

const stripUndefined = <T extends Record<string, any>>(value: T): T =>
  Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined),
  ) as T;

const toAppUser = (data: DocumentData, fallbackId: string): AppUser => {
  const uid = data.uid || fallbackId;
  const joinedAt = data.joinedAt || '';
  return {
    ...(data as UserProfile),
    uid,
    id: uid,
    joinedDate: joinedAt ? joinedAt.split('T')[0] : '',
  };
};

const getPeriodStart = (period: '7d' | '30d' | 'all') => {
  if (period === 'all') return null;
  const date = new Date();
  date.setDate(date.getDate() - (period === '7d' ? 7 : 30));
  return date;
};

/* --- THE SERVICE --- */
export const firebaseStore = {
  // --- AUTHENTICATION ---

  // 1. Sign Up (Auth + Firestore Profile)
  async registerUser(data: any) {
    const fields = { ...data };
    for (const key of ['phone', 'ec1Phone', 'ec2Phone', 'ec3Phone']) {
      fields[key] = fields[key]?.replace(/^\+1/, '');
    }
    await registrationSchema.validate(fields, { abortEarly: false });
    const emergencyContacts = normalizeContacts([
      { name: data.ec1Name, phone: data.ec1Phone },
      { name: data.ec2Name, phone: data.ec2Phone },
      { name: data.ec3Name, phone: data.ec3Phone },
    ]);
    try {
      // A. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const uid = userCredential.user.uid;

      // B. Prepare Profile Data
      const newProfile: UserProfile = {
        uid,
        email: data.email.trim().toLowerCase(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone,
        dob: data.dob,
        agent: data.agent,
        requestedAgentName: data.requestedAgentName || '',
        agentStatus: data.agentStatus || 'assigned',
        emergencyContacts,
        role: 'user',
        joinedAt: new Date().toISOString(),
        panicCount: 0,
        // Legal Compliance
        consentGiven: true,
        consentTimestamp: data.consentTimestamp || new Date().toISOString(),
        consentText: data.consentText,
        consentVersion: data.consentVersion,
      };

      // C. Save to Firestore 'users' collection
      try {
        await setDoc(doc(db, 'users', uid), newProfile);
      } catch (error) {
        await deleteUser(userCredential.user).catch(() => signOut(auth));
        throw error;
      }

      return toAppUser(newProfile, uid);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // 2. Login
  async loginUser(email: string, pass: string) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), pass);
      const uid = cred.user.uid;

      // Fetch Profile
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return toAppUser(docSnap.data(), uid);
      } else {
        throw new Error('User profile not found.');
      }
    } catch (error: any) {
      await signOut(auth).catch(() => {});
      throw error;
    }
  },

  async logout() {
    await signOut(auth);
  },

  async sendPasswordReset(email: string) {
    const cleanEmail = email.trim().toLowerCase();
    await sendPasswordResetEmail(auth, cleanEmail);
  },

  // --- USER FEATURES ---

  // 3. Log Panic Trigger
  async logPanicEvent(
    user: AppUser,
    locationLink: string,
    coords?: { latitude: number; longitude: number; accuracy?: number | null },
  ) {
    try {
      // Add to 'panic_logs' collection
      const batch = writeBatch(db);
      batch.set(
        doc(collection(db, 'panic_logs')),
        stripUndefined({
          userId: user.uid,
          userName: `${user.firstName} ${user.lastName}`,
          userPhone: user.phone,
          agent: user.agent,
          timestamp: nowIso(),
          location: locationLink,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          accuracy: coords?.accuracy ?? null,
        }),
      );

      // Increment User's Panic Count
      const userRef = doc(db, 'users', user.uid);
      batch.update(userRef, {
        panicCount: increment(1),
        lastPanicAt: nowIso(),
      });
      await batch.commit();
    } catch (e) {
      throw e;
    }
  },

  async updateUserProfile(uid: string, data: Partial<UserProfile>) {
    const userRef = doc(db, 'users', uid);
    const allowed = [
      'firstName',
      'lastName',
      'dob',
      'phone',
      'agent',
      'requestedAgentName',
      'agentStatus',
      'emergencyContacts',
    ];
    if (Object.keys(data).some((key) => !allowed.includes(key)))
      throw new Error('Unsupported profile update.');
    const existing = await getDoc(userRef);
    if (!existing.exists()) throw new Error('User profile not found.');
    const merged = { ...existing.data(), ...data };
    const contacts = normalizeContacts(merged.emergencyContacts || []);
    await profileSchema.validate({
      ...merged,
      phone: merged.phone?.replace(/^\+1/, ''),
      ...Object.fromEntries(
        contacts.flatMap((c, i) => [
          [`ec${i + 1}Name`, c.name],
          [`ec${i + 1}Phone`, c.phone.replace(/^\+1/, '')],
        ]),
      ),
    });
    await updateDoc(
      userRef,
      stripUndefined({ ...data, emergencyContacts: contacts, updatedAt: nowIso() }),
    );
    const snap = await getDoc(userRef);
    if (!snap.exists()) throw new Error('User profile not found.');
    return toAppUser(snap.data(), uid);
  },

  async deleteAccount(uid: string, password: string) {
    const user = auth.currentUser;
    if (!user?.email || !password) throw new Error('Enter your password to confirm deletion.');
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
    await user.getIdToken(true);
    const remove = httpsCallable(getFunctions(auth.app), 'deleteAccount');
    await remove({ uid });
  },

  // --- ADMIN FEATURES ---

  // 4. Get/Set Recipients
  // We store configuration in a single doc: 'config/global'
  async getAdminSettings() {
    const docRef = doc(db, 'config', 'global');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as { primaryCall?: string; smsList?: Recipient[] };
      return { primaryCall: data.primaryCall || '', smsList: data.smsList || [] };
    } else {
      // Initialize if missing
      const initialData = { primaryCall: '', smsList: [] };
      return initialData;
    }
  },

  async addRecipient(name: string, phone: string) {
    const settings = await this.getAdminSettings();
    const newRecipient = { id: Date.now().toString(), name, phone };
    const newList = [...settings.smsList, newRecipient];

    await setDoc(doc(db, 'config', 'global'), { smsList: newList }, { merge: true });
  },

  async removeRecipient(id: string) {
    const settings = await this.getAdminSettings();
    const newList = settings.smsList.filter((r) => r.id !== id);
    await setDoc(doc(db, 'config', 'global'), { smsList: newList }, { merge: true });
  },

  async updatePrimaryCall(phone: string) {
    await setDoc(doc(db, 'config', 'global'), { primaryCall: phone }, { merge: true });
  },

  // 5. Agents
  async fetchAgents(includeInactive = false) {
    const snap = await getDocs(collection(db, 'agents'));
    const agents = snap.docs.map((agentDoc) => {
      const data = agentDoc.data() as Omit<Agent, 'id'>;
      return { id: agentDoc.id, ...data };
    });

    return agents
      .filter((agent) => includeInactive || agent.active !== false)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async fetchAgentNames(extraAgent?: string) {
    const agents = await this.fetchAgents();
    return uniqueNames([...agents.map((agent) => agent.name), extraAgent]);
  },

  async addAgent(name: string) {
    const cleanName = name.trim();
    if (!cleanName) return null;

    const normalizedName = normalizeAgentName(cleanName);
    const existingQuery = query(
      collection(db, 'agents'),
      where('normalizedName', '==', normalizedName),
      limit(1),
    );
    const existing = await getDocs(existingQuery);
    if (!existing.empty) {
      const existingDoc = existing.docs[0];
      return { id: existingDoc.id, ...(existingDoc.data() as Omit<Agent, 'id'>) };
    }

    const created = await addDoc(collection(db, 'agents'), {
      name: cleanName,
      normalizedName,
      active: true,
      createdAt: nowIso(),
    });

    return { id: created.id, name: cleanName, normalizedName, active: true, createdAt: nowIso() };
  },

  async removeAgent(id: string) {
    await deleteDoc(doc(db, 'agents', id));
  },

  async fetchPendingAgentRequests() {
    const q = query(collection(db, 'users'), where('agentStatus', '==', 'pending'));
    const snap = await getDocs(q);
    return snap.docs
      .map((userDoc) => toAppUser(userDoc.data(), userDoc.id))
      .filter((user) => !!user.requestedAgentName)
      .sort((a, b) => (a.joinedAt || '').localeCompare(b.joinedAt || ''));
  },

  async assignAgentToUser(userId: string, agentName: string) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      agent: agentName,
      requestedAgentName: '',
      agentStatus: 'assigned',
      updatedAt: nowIso(),
    });
  },

  // 6. Admin Users and Metrics
  async fetchAllUsers() {
    const q = query(collection(db, 'users'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d) => toAppUser(d.data(), d.id));
  },

  async fetchPanicLogs() {
    const q = query(collection(db, 'panic_logs'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PanicLog, 'id'>) }));
  },

  async fetchMetrics(period: '7d' | '30d' | 'all') {
    const [users, logs] = await Promise.all([this.fetchAllUsers(), this.fetchPanicLogs()]);
    const start = getPeriodStart(period);

    const isInPeriod = (iso?: string) => {
      if (!start) return true;
      if (!iso) return false;
      return new Date(iso) >= start;
    };

    const periodUsers = users.filter((user) => isInPeriod(user.joinedAt));
    const periodLogs = logs.filter((log) => isInPeriod(log.timestamp));
    const alertCounts = periodLogs.reduce<Record<string, number>>((acc, log) => {
      const key = log.userId || log.userPhone || log.userName;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const topUsers = users
      .map((user) => ({
        ...user,
        panicCount:
          period === 'all'
            ? user.panicCount || alertCounts[user.uid] || 0
            : alertCounts[user.uid] || 0,
      }))
      .filter((user) => (user.panicCount || 0) > 0)
      .sort((a, b) => (b.panicCount || 0) - (a.panicCount || 0));

    return {
      newSignups: periodUsers.filter((user) => user.role !== 'admin').length,
      activeUsers: new Set(periodLogs.map((log) => log.userId || log.userPhone)).size,
      topUsers,
      recentLogs: periodLogs,
    };
  },
};
