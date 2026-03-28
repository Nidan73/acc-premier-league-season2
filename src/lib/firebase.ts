/**
 * Firebase Configuration for ACC Futsal League
 * Project: ACCPL-S2
 * 
 * This file initializes Firebase and exports the database reference
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, update, remove, push } from 'firebase/database';

// Firebase configuration from environment variables
// Falls back to direct values for development
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDGe48Ehv0HWg-sMDzxMcyYQNThlfdKbHU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "accpl-s2.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://accpl-s2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "accpl-s2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "accpl-s2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "259158367326",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:259158367326:web:e1f15dd66569da5051e8cf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get database reference
export const database = getDatabase(app);

// Database path references
export const DB_PATHS = {
  PLAYERS: 'players',
  TEAMS: 'teams',
  ROSTERS: 'rosters',
  AUCTION_STATE: 'auctionState',
  MATCHES: 'matches',
  FINAL_MATCH: 'finalMatch',
  AUDIT_LOGS: 'auditLogs',
  SETTINGS: 'settings',
} as const;

// Helper function to get database reference
export const getRef = (path: string) => ref(database, path);

// Export Firebase utilities
export { ref, set, get, onValue, update, remove, push };

// Export the app for any additional Firebase services
export default app;
