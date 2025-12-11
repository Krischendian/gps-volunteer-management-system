import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ⚠️ REPLACE THE VALUES BELOW WITH YOUR FIREBASE CONSOLE CONFIGURATION
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBxsHBfRY2D_kALM_Q_sKQ6sSAB6g3zU5U",
  authDomain: "gps-volunteer-management.firebaseapp.com",
  projectId: "gps-volunteer-management",
  storageBucket: "gps-volunteer-management.firebasestorage.app",
  messagingSenderId: "1071855293910",
  appId: "1:1071855293910:web:648f877f15292a167f8077",
  measurementId: "G-CC23DTWMCT"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);