import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/chat.messages.create');
googleProvider.addScope('https://www.googleapis.com/auth/chat.messages.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/chat.messages');
googleProvider.addScope('https://www.googleapis.com/auth/chat.spaces.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/chat.spaces');
googleProvider.addScope('https://www.googleapis.com/auth/chat.memberships.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/chat.memberships');
googleProvider.addScope('https://www.googleapis.com/auth/chat.users.readstate.readonly');

export const facebookProvider = new FacebookAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// In-memory cache for Google OAuth access token
let cachedGoogleAccessToken: string | null = null;

export const setGoogleAccessToken = (token: string | null) => {
  cachedGoogleAccessToken = token;
};

export const getGoogleAccessToken = () => cachedGoogleAccessToken;
