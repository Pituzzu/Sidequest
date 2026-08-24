import {
  type FirebaseApp,
  type FirebaseOptions,
  getApp,
  getApps,
  initializeApp,
} from 'firebase/app';
import { type Auth } from 'firebase/auth';
import { type Firestore, getFirestore } from 'firebase/firestore';
import { type FirebaseStorage, getStorage } from 'firebase/storage';

import { initializeFirebaseAuth } from './firebaseAuth';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || undefined,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

const requiredFirebaseEnvironment = {
  EXPO_PUBLIC_FIREBASE_API_KEY: firebaseConfig.apiKey,
  EXPO_PUBLIC_FIREBASE_APP_ID: firebaseConfig.appId,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: firebaseConfig.messagingSenderId,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: firebaseConfig.storageBucket,
};

export const missingFirebaseEnvironmentVariables = Object.entries(
  requiredFirebaseEnvironment,
)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const isFirebaseConfigured = missingFirebaseEnvironmentVariables.length === 0;

export type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
};

let cachedServices: FirebaseServices | null = null;

export function getFirebaseServices(): FirebaseServices {
  if (cachedServices) {
    return cachedServices;
  }

  if (!isFirebaseConfigured) {
    throw new Error(
      `Configurazione Firebase incompleta. Variabili mancanti: ${missingFirebaseEnvironmentVariables.join(', ')}`,
    );
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  cachedServices = {
    app,
    auth: initializeFirebaseAuth(app),
    db: getFirestore(app),
    storage: getStorage(app),
  };

  return cachedServices;
}
