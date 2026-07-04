import { initializeApp } from 'firebase/app';
// We import auth and firestore to ensure they are initialized
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ACTUAL KEYS FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyC_RlPOxWGvn2iZXwXRHKvAsljojcVZ-_o",
  authDomain: "bond-app-prod-2026.firebaseapp.com",
  projectId: "bond-app-prod-2026",
  storageBucket: "bond-app-prod-2026.firebasestorage.app",
  messagingSenderId: "530638402767",
  appId: "1:530638402767:web:919a8a21bc6bab1d97b3ba",
  measurementId: "G-LQWB97CR7C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);