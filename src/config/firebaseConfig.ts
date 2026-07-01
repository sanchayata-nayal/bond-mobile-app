import { initializeApp } from 'firebase/app';
// We import auth and firestore to ensure they are initialized
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// REPLACE WITH YOUR ACTUAL KEYS FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyBo_6ZHo0geMVnBrk8YjnKA1i6GNvGsAhU",
  authDomain: "bond-mobile-app-83629.firebaseapp.com",
  projectId: "bond-mobile-app-83629",
  storageBucket: "bond-mobile-app-83629.firebasestorage.app",
  messagingSenderId: "562290246654",
  appId: "1:562290246654:web:7966c797490653ff4136af"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);