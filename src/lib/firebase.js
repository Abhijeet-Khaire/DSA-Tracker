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
export default app;
