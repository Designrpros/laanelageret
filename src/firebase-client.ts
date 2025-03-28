// src/firebase-client.ts
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging"; // Add this

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, // Add this from Firebase Console
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const messaging = typeof window !== "undefined" ? getMessaging(app) : null; // FCM only works client-side