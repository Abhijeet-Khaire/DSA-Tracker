import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB5h5DKDPPBFVM8qrn6j5SOubpSsV-wzAA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dsa-tracker-197f7.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dsa-tracker-197f7",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dsa-tracker-197f7.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "97422210878",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:97422210878:web:a4788eb16706c1dcbede6f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-6L2753HKH5"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Converts Firebase Auth error codes into clear, user-friendly messages
 */
export function formatAuthError(error) {
  if (!error) return 'An unknown error occurred.';
  const code = error.code || '';
  const msg = error.message || '';

  if (code === 'auth/operation-not-allowed' || msg.includes('OPERATION_NOT_ALLOWED')) {
    return 'Email/Password sign-in is not enabled in your Firebase Console. Please go to Firebase Console > Authentication > Sign-in method, click "Email/Password", and enable it.';
  }
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
    return 'Invalid email or password. Please verify your credentials or create a new account.';
  }
  if (code === 'auth/user-not-found') {
    return 'No account exists with this email address. Please sign up first.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Google sign-in popup was closed before completion.';
  }
  if (code === 'auth/popup-blocked') {
    return 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'This domain is not authorized in your Firebase Console (Authentication > Settings > Authorized domains).';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network connection failed. Please check your internet connection.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many failed login attempts. Please wait a moment before trying again.';
  }

  return msg.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '').trim() || 'Authentication failed. Please try again.';
}

export default app;
