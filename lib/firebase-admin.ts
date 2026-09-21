import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length === 0 
  ? initializeApp({ projectId: firebaseConfig.projectId }) 
  : getApp();

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

// Check if credentials exist for Firestore Admin operations to avoid blocking timeouts
const hasAdminCredentials = Boolean(
  process.env.GOOGLE_APPLICATION_CREDENTIALS || 
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
  process.env.FIREBASE_PRIVATE_KEY
);

// Global flag to track if Firestore API is enabled and accessible
export let isFirestoreEnabled = hasAdminCredentials;

export function setFirestoreEnabled(enabled: boolean) {
  isFirestoreEnabled = enabled;
}
