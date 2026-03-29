/**
 * Firebase Configuration for ACC Futsal League
 * Project: ACCPL-S2
 *
 * This file initializes Firebase and exports the database reference
 */

import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  update,
  remove,
  push,
} from "firebase/database";

// Firebase configuration from environment variables
// Falls back to direct values for development
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get database reference
export const database = getDatabase(app);

// Database path references
export const DB_PATHS = {
  PLAYERS: "players",
  TEAMS: "teams",
  ROSTERS: "rosters",
  AUCTION_STATE: "auctionState",
  MATCHES: "matches",
  FINAL_MATCH: "finalMatch",
  AUDIT_LOGS: "auditLogs",
  SETTINGS: "settings",
} as const;

// Helper function to get database reference
export const getRef = (path: string) => ref(database, path);

// Export Firebase utilities
export { ref, set, get, onValue, update, remove, push };

// Export the app for any additional Firebase services
export default app;
