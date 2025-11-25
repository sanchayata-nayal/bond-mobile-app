import { initializeApp } from 'firebase/app';
// We import auth and firestore to ensure they are initialized
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// REPLACE WITH YOUR ACTUAL KEYS FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSy...", 
  authDomain: "bond-app-xyz.firebaseapp.com",
  projectId: "bond-app-xyz",
  storageBucket: "bond-app-xyz.firebasestorage.app",
  messagingSenderId: "123456...",
  appId: "1:123456..."
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);