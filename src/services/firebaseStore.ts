// src/services/firebaseStore.ts
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updatePassword 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc 
} from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

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
  emergencyContacts: EmergencyContact[];
  role: 'user' | 'admin';
  joinedAt: string;      // ISO Date
  consentGiven: boolean; // Legal requirement
  panicCount: number;
};

export type Recipient = {
  id: string;
  name: string;
  phone: string;
};

/* --- THE SERVICE --- */
export const firebaseStore = {
  
  // --- AUTHENTICATION ---

  // 1. Sign Up (Auth + Firestore Profile)
  async registerUser(data: any) {
    try {
      // A. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const uid = userCredential.user.uid;

      // B. Prepare Profile Data
      const newProfile: UserProfile = {
        uid,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        dob: data.dob,
        agent: data.agent,
        emergencyContacts: [
          { name: data.ec1Name, phone: data.ec1Phone },
          { name: data.ec2Name, phone: data.ec2Phone },
          { name: data.ec3Name, phone: data.ec3Phone },
        ],
        role: 'user',
        joinedAt: new Date().toISOString(),
        consentGiven: true, // Captured from disclaimer
        panicCount: 0,
      };

      // C. Save to Firestore 'users' collection
      await setDoc(doc(db, 'users', uid), newProfile);
      
      return newProfile;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // 2. Login
  async loginUser(email: string, pass: string) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const uid = cred.user.uid;
      
      // Fetch Profile
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      } else {
        throw new Error('User profile not found.');
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async logout() {
    await signOut(auth);
  },

  // --- USER FEATURES ---

  // 3. Log Panic Trigger
  async logPanicEvent(user: UserProfile, locationLink: string) {
    try {
      // Add to 'panic_logs' collection
      await addDoc(collection(db, 'panic_logs'), {
        userId: user.uid,
        userName: `${user.firstName} ${user.lastName}`,
        userPhone: user.phone,
        agent: user.agent,
        timestamp: new Date().toISOString(),
        location: locationLink,
      });

      // Increment User's Panic Count
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        panicCount: (user.panicCount || 0) + 1
      });
    } catch (e) {
      console.error("Panic Log Error", e);
    }
  },

  async updateUserProfile(uid: string, data: Partial<UserProfile>) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
  },

  async deleteAccount(uid: string) {
    // In a real app, you'd delete the Auth user too, but that requires recent login re-auth.
    // For MVP, deleting the DB record is often enough to "disable" access.
    await deleteDoc(doc(db, 'users', uid));
    // Optional: await auth.currentUser?.delete();
  },

  // --- ADMIN FEATURES ---

  // 4. Get/Set Recipients
  // We store configuration in a single doc: 'config/global'
  async getAdminSettings() {
    const docRef = doc(db, 'config', 'global');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as { primaryCall: string; smsList: Recipient[] };
    } else {
      // Initialize if missing
      const initialData = { primaryCall: '', smsList: [] };
      await setDoc(docRef, initialData);
      return initialData;
    }
  },

  async addRecipient(name: string, phone: string) {
    const settings = await this.getAdminSettings();
    const newRecipient = { id: Date.now().toString(), name, phone };
    const newList = [...settings.smsList, newRecipient];
    
    await updateDoc(doc(db, 'config', 'global'), { smsList: newList });
  },

  async removeRecipient(id: string) {
    const settings = await this.getAdminSettings();
    const newList = settings.smsList.filter(r => r.id !== id);
    await updateDoc(doc(db, 'config', 'global'), { smsList: newList });
  },

  async updatePrimaryCall(phone: string) {
    await updateDoc(doc(db, 'config', 'global'), { primaryCall: phone });
  },

  // 5. Admin Metrics
  async fetchAllUsers() {
    const q = query(collection(db, 'users'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => d.data() as UserProfile);
  },

  async fetchPanicLogs() {
    const q = query(collection(db, 'panic_logs'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};