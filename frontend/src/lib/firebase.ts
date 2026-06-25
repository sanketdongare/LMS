import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword as fbSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as fbCreateUserWithEmailAndPassword,
  signInWithPopup as fbSignInWithPopup,
  GoogleAuthProvider as fbGoogleAuthProvider,
  signOut as fbSignOut,
  updateProfile as fbUpdateProfile,
  onAuthStateChanged as fbOnAuthStateChanged,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: any;
let auth: any;
let isMockMode = false;

// Check if the API key is placeholder
const isPlaceholderKey =
  !firebaseConfig.apiKey ||
  firebaseConfig.apiKey.includes('AIzaSyAp3V2EJ56gJsy6svCoQ5Fb0HF_cbAUKz0') ||
  firebaseConfig.apiKey.startsWith('your-') ||
  firebaseConfig.apiKey === '';

if (isPlaceholderKey) {
  console.warn("Using placeholder Firebase API key. Enabling Mock Auth mode.");
  isMockMode = true;
} else {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
  } catch (error) {
    console.error("Firebase initialization failed, falling back to Mock Auth mode:", error);
    isMockMode = true;
  }
}

// Set up mock auth object if in mock mode
if (isMockMode) {
  auth = {
    currentUser: null,
  } as any;
}

// Helper to get mock user object
const getMockUser = (email: string, displayName?: string | null) => {
  const uid = email === 'admin@sdlms.com' ? 'demo-super-admin-uid' : `mock-uid-${email.replace(/[@.]/g, '-')}`;
  return {
    uid,
    email,
    displayName: displayName || email.split('@')[0],
    photoURL: null,
    getIdToken: async () => `mock-token-${uid}`,
  };
};

// Wrap functions to support mock mode
export const signInWithEmailAndPassword = async (authObj: any, email: string, password: string): Promise<any> => {
  if (isMockMode) {
    const mockUser = getMockUser(email);
    auth.currentUser = mockUser as any;
    triggerAuthStateChange(auth.currentUser);
    return { user: auth.currentUser };
  }
  return fbSignInWithEmailAndPassword(authObj, email, password);
};

export const createUserWithEmailAndPassword = async (authObj: any, email: string, password: string): Promise<any> => {
  if (isMockMode) {
    const mockUser = getMockUser(email);
    auth.currentUser = mockUser as any;
    triggerAuthStateChange(auth.currentUser);
    return { user: auth.currentUser };
  }
  return fbCreateUserWithEmailAndPassword(authObj, email, password);
};

export const signInWithPopup = async (authObj: any, provider: any): Promise<any> => {
  if (isMockMode) {
    const mockUser = getMockUser('googleuser@sdlms.com', 'Google User');
    auth.currentUser = mockUser as any;
    triggerAuthStateChange(auth.currentUser);
    return { user: auth.currentUser };
  }
  return fbSignInWithPopup(authObj, provider);
};

export class GoogleAuthProvider {
  constructor() {
    if (!isMockMode) {
      return new fbGoogleAuthProvider() as any;
    }
  }
}

export const signOut = async (authObj: any): Promise<any> => {
  if (isMockMode) {
    auth.currentUser = null;
    triggerAuthStateChange(null);
    return;
  }
  return fbSignOut(authObj);
};

export const updateProfile = async (userObj: any, { displayName, photoURL }: { displayName?: string; photoURL?: string }): Promise<any> => {
  if (isMockMode) {
    if (auth.currentUser) {
      if (displayName) auth.currentUser.displayName = displayName;
      if (photoURL) auth.currentUser.photoURL = photoURL;
      triggerAuthStateChange(auth.currentUser);
    }
    return;
  }
  return fbUpdateProfile(userObj, { displayName, photoURL });
};

// Listeners management for mock mode
const authStateListeners: Array<(user: any) => void> = [];

const triggerAuthStateChange = (user: any) => {
  authStateListeners.forEach((listener) => listener(user));
};

export const onAuthStateChanged = (authObj: any, callback: (user: any) => void): (() => void) => {
  if (isMockMode) {
    authStateListeners.push(callback);
    setTimeout(() => callback(auth.currentUser), 0);
    return () => {
      const index = authStateListeners.indexOf(callback);
      if (index > -1) {
        authStateListeners.splice(index, 1);
      }
    };
  }
  return fbOnAuthStateChanged(authObj, callback);
};

export { app, auth, isMockMode };
