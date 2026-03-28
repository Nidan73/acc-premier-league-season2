# 🔥 Firebase Setup Guide - Step by Step

This guide walks you through setting up Firebase for the ACC Futsal League app with real-time database functionality.

## Table of Contents

1. [Create Firebase Project](#1-create-firebase-project)
2. [Enable Firestore Database](#2-enable-firestore-database)
3. [Enable Authentication](#3-enable-authentication)
4. [Get Configuration](#4-get-configuration)
5. [Install Firebase in Project](#5-install-firebase-in-project)
6. [Create Firebase Config File](#6-create-firebase-config-file)
7. [Create Firebase Service](#7-create-firebase-service)
8. [Update Environment Variables](#8-update-environment-variables)
9. [Initialize Firestore Collections](#9-initialize-firestore-collections)
10. [Set Security Rules](#10-set-security-rules)
11. [Update AppContext for Real-time](#11-update-appcontext-for-real-time)
12. [Deploy to Firebase Hosting](#12-deploy-to-firebase-hosting)

---

## 1. Create Firebase Project

### Step 1.1: Go to Firebase Console
Visit: https://console.firebase.google.com/

### Step 1.2: Click "Create a project"

### Step 1.3: Enter Project Details
- **Project name**: `acc-futsal-league`
- Click **Continue**

### Step 1.4: Google Analytics (Optional)
- You can disable it for simplicity
- Click **Create Project**

### Step 1.5: Wait for Project Creation
- Takes about 30 seconds
- Click **Continue** when done

---

## 2. Enable Firestore Database

### Step 2.1: Navigate to Firestore
- In the left sidebar, click **Build** → **Firestore Database**

### Step 2.2: Create Database
- Click **Create database**

### Step 2.3: Select Mode
- Choose **Start in test mode** (we'll add rules later)
- Click **Next**

### Step 2.4: Select Location
- Choose closest region (e.g., `asia-south1` for Bangladesh)
- Click **Enable**

---

## 3. Enable Authentication

### Step 3.1: Navigate to Authentication
- In the left sidebar, click **Build** → **Authentication**

### Step 3.2: Click "Get started"

### Step 3.3: Enable Email/Password
- Click **Email/Password**
- Toggle **Enable**
- Click **Save**

### Step 3.4: Create Admin User
- Go to **Users** tab
- Click **Add user**
- Enter admin email and password
- **Important**: Save these credentials!

Example:
```
Email: admin@accfutsal.com
Password: SecurePass123!
```

---

## 4. Get Configuration

### Step 4.1: Go to Project Settings
- Click the gear icon ⚙️ next to **Project Overview**
- Click **Project settings**

### Step 4.2: Scroll to "Your apps"
- Click the web icon `</>`

### Step 4.3: Register App
- App nickname: `ACC Futsal Web`
- ☑️ Check "Also set up Firebase Hosting"
- Click **Register app**

### Step 4.4: Copy Configuration
You'll see something like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "acc-futsal-league.firebaseapp.com",
  projectId: "acc-futsal-league",
  storageBucket: "acc-futsal-league.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

**Save these values!** You'll need them in Step 8.

---

## 5. Install Firebase in Project

Run in your project terminal:

```bash
npm install firebase
```

---

## 6. Create Firebase Config File

Create a new file: `src/lib/firebase.ts`

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Persistence not available in this browser');
  }
});

// Initialize Auth
export const auth = getAuth(app);

export default app;
```

---

## 7. Create Firebase Service

Create a new file: `src/services/firebaseService.ts`

```typescript
// src/services/firebaseService.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Timestamp,
  query,
  orderBy,
  limit,
  type Unsubscribe,
} from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import type {
  Player,
  TeamId,
  TeamRoster,
  AuctionState,
  LeagueMatch,
  FinalMatch,
  AuditLog,
} from '@/types';

// ============ COLLECTIONS ============

const COLLECTIONS = {
  PLAYERS: 'players',
  ROSTERS: 'rosters',
  AUCTION_STATE: 'auctionState',
  MATCHES: 'matches',
  FINAL_MATCH: 'finalMatch',
  TEAM_SETTINGS: 'teamSettings',
  LOGS: 'logs',
  ADMINS: 'admins',
} as const;

// ============ PLAYERS ============

export async function getPlayers(): Promise<Player[]> {
  const snapshot = await getDocs(collection(db, COLLECTIONS.PLAYERS));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Player));
}

export async function updatePlayer(id: string, data: Partial<Player>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.PLAYERS, id), data);
}

export function subscribeToPlayers(callback: (players: Player[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COLLECTIONS.PLAYERS), (snapshot) => {
    const players = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Player));
    callback(players);
  });
}

// ============ ROSTERS ============

export async function getRosters(): Promise<TeamRoster[]> {
  const snapshot = await getDocs(collection(db, COLLECTIONS.ROSTERS));
  return snapshot.docs.map((doc) => ({ teamId: doc.id as TeamId, ...doc.data() } as TeamRoster));
}

export async function updateRoster(teamId: TeamId, playerIds: string[]): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.ROSTERS, teamId), { teamId, playerIds });
}

export function subscribeToRosters(callback: (rosters: TeamRoster[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COLLECTIONS.ROSTERS), (snapshot) => {
    const rosters = snapshot.docs.map((doc) => ({
      teamId: doc.id as TeamId,
      playerIds: doc.data().playerIds || [],
    } as TeamRoster));
    callback(rosters);
  });
}

// ============ AUCTION STATE ============

export async function getAuctionState(): Promise<AuctionState | null> {
  const docSnap = await getDoc(doc(db, COLLECTIONS.AUCTION_STATE, 'current'));
  return docSnap.exists() ? (docSnap.data() as AuctionState) : null;
}

export async function updateAuctionState(data: Partial<AuctionState>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.AUCTION_STATE, 'current'), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function initializeAuctionState(state: AuctionState): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.AUCTION_STATE, 'current'), state);
}

export function subscribeToAuctionState(callback: (state: AuctionState) => void): Unsubscribe {
  return onSnapshot(doc(db, COLLECTIONS.AUCTION_STATE, 'current'), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as AuctionState);
    }
  });
}

// ============ MATCHES ============

export async function getMatches(): Promise<LeagueMatch[]> {
  const snapshot = await getDocs(collection(db, COLLECTIONS.MATCHES));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as LeagueMatch));
}

export async function updateMatch(id: string, data: Partial<LeagueMatch>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.MATCHES, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export function subscribeToMatches(callback: (matches: LeagueMatch[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COLLECTIONS.MATCHES), (snapshot) => {
    const matches = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as LeagueMatch));
    callback(matches);
  });
}

// ============ FINAL MATCH ============

export async function getFinalMatch(): Promise<FinalMatch | null> {
  const docSnap = await getDoc(doc(db, COLLECTIONS.FINAL_MATCH, 'current'));
  return docSnap.exists() ? (docSnap.data() as FinalMatch) : null;
}

export async function updateFinalMatch(data: Partial<FinalMatch>): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.FINAL_MATCH, 'current'), data, { merge: true });
}

export function subscribeToFinalMatch(callback: (match: FinalMatch | null) => void): Unsubscribe {
  return onSnapshot(doc(db, COLLECTIONS.FINAL_MATCH, 'current'), (snapshot) => {
    callback(snapshot.exists() ? (snapshot.data() as FinalMatch) : null);
  });
}

// ============ TEAM SETTINGS ============

export async function getTeamSettings(): Promise<Record<TeamId, { ownerName: string }>> {
  const snapshot = await getDocs(collection(db, COLLECTIONS.TEAM_SETTINGS));
  const settings: Record<string, { ownerName: string }> = {};
  snapshot.docs.forEach((doc) => {
    settings[doc.id] = doc.data() as { ownerName: string };
  });
  return settings as Record<TeamId, { ownerName: string }>;
}

export async function updateTeamOwner(teamId: TeamId, ownerName: string): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.TEAM_SETTINGS, teamId), { ownerName });
}

export function subscribeToTeamSettings(
  callback: (settings: Record<TeamId, { ownerName: string }>) => void
): Unsubscribe {
  return onSnapshot(collection(db, COLLECTIONS.TEAM_SETTINGS), (snapshot) => {
    const settings: Record<string, { ownerName: string }> = {};
    snapshot.docs.forEach((doc) => {
      settings[doc.id] = doc.data() as { ownerName: string };
    });
    callback(settings as Record<TeamId, { ownerName: string }>);
  });
}

// ============ LOGS ============

export async function addLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
  const id = `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  await setDoc(doc(db, COLLECTIONS.LOGS, id), {
    ...log,
    id,
    timestamp: new Date().toISOString(),
  });
}

export async function getLogs(limitCount: number = 100): Promise<AuditLog[]> {
  const q = query(
    collection(db, COLLECTIONS.LOGS),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as AuditLog);
}

export function subscribeToLogs(callback: (logs: AuditLog[]) => void, limitCount: number = 50): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.LOGS),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => doc.data() as AuditLog);
    callback(logs);
  });
}

// ============ AUTH ============

export async function loginAdmin(email: string, password: string): Promise<User | null> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Login failed:', error);
    return null;
  }
}

export async function logoutAdmin(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

// ============ BULK OPERATIONS ============

export async function initializeAllData(data: {
  players: Player[];
  rosters: TeamRoster[];
  auctionState: AuctionState;
  matches: LeagueMatch[];
  teamSettings: Record<TeamId, { ownerName: string }>;
}): Promise<void> {
  const batch = writeBatch(db);

  // Add players
  data.players.forEach((player) => {
    batch.set(doc(db, COLLECTIONS.PLAYERS, player.id), player);
  });

  // Add rosters
  data.rosters.forEach((roster) => {
    batch.set(doc(db, COLLECTIONS.ROSTERS, roster.teamId), roster);
  });

  // Add auction state
  batch.set(doc(db, COLLECTIONS.AUCTION_STATE, 'current'), data.auctionState);

  // Add matches
  data.matches.forEach((match) => {
    batch.set(doc(db, COLLECTIONS.MATCHES, match.id), match);
  });

  // Add team settings
  Object.entries(data.teamSettings).forEach(([teamId, settings]) => {
    batch.set(doc(db, COLLECTIONS.TEAM_SETTINGS, teamId), settings);
  });

  await batch.commit();
}

export async function resetAllData(): Promise<void> {
  // This is a simplified version - in production you'd want to be more careful
  const collections = [
    COLLECTIONS.PLAYERS,
    COLLECTIONS.ROSTERS,
    COLLECTIONS.MATCHES,
    COLLECTIONS.LOGS,
  ];

  for (const collectionName of collections) {
    const snapshot = await getDocs(collection(db, collectionName));
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  // Delete single documents
  await deleteDoc(doc(db, COLLECTIONS.AUCTION_STATE, 'current'));
  await deleteDoc(doc(db, COLLECTIONS.FINAL_MATCH, 'current'));
}
```

---

## 8. Update Environment Variables

Create or update `.env` file in project root:

```env
# Admin passcode (for fallback local auth)
VITE_ADMIN_PASSCODE=847291

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyD...your-api-key
VITE_FIREBASE_AUTH_DOMAIN=acc-futsal-league.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=acc-futsal-league
VITE_FIREBASE_STORAGE_BUCKET=acc-futsal-league.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456

# Feature flag to use Firebase (set to 'true' to enable)
VITE_USE_FIREBASE=true
```

---

## 9. Initialize Firestore Collections

Create a migration script: `scripts/initFirebase.ts`

```typescript
// Run this once to initialize your Firebase database
import { INITIAL_PLAYERS } from '../src/data/players';
import { TEAMS, generateInitialMatches } from '../src/constants';
import { initializeAllData } from '../src/services/firebaseService';

async function initialize() {
  const initialRosters = TEAMS.map((team) => ({
    teamId: team.id,
    playerIds: [],
  }));

  const initialTeamSettings = {
    rabies: { ownerName: 'Sami' },
    meow: { ownerName: 'Ashik' },
    nazi: { ownerName: 'Bkash (Khalid)' },
    goaldiggers: { ownerName: 'Sadid' },
    crazy: { ownerName: 'Fardin' },
  };

  const initialAuctionState = {
    phase: 'NOT_STARTED',
    currentPlayerId: null,
    basePrice: 0,
    currentBid: 0,
    leadingTeamId: null,
    bidHistory: [],
    updatedAt: new Date().toISOString(),
    lastSoldLogId: null,
  };

  await initializeAllData({
    players: INITIAL_PLAYERS,
    rosters: initialRosters,
    auctionState: initialAuctionState,
    matches: generateInitialMatches(),
    teamSettings: initialTeamSettings,
  });

  console.log('✅ Firebase initialized with all data!');
}

initialize().catch(console.error);
```

---

## 10. Set Security Rules

In Firebase Console → Firestore → Rules, paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Players - anyone can read, only auth can write
    match /players/{playerId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    // Rosters - anyone can read, only auth can write
    match /rosters/{teamId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    // Auction State - anyone can read (for live display), only auth can write
    match /auctionState/{docId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    // Matches - anyone can read, only auth can write
    match /matches/{matchId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    // Final Match
    match /finalMatch/{docId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    // Team Settings
    match /teamSettings/{teamId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    // Logs - only authenticated users
    match /logs/{logId} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

Click **Publish** to save the rules.

---

## 11. Update AppContext for Real-time

Replace your `AppContext.tsx` with Firebase subscriptions:

```typescript
// In your AppContext.tsx, add Firebase subscriptions

import { useEffect } from 'react';
import * as firebaseService from '@/services/firebaseService';

// Inside AppProvider component:
useEffect(() => {
  // Check if Firebase is enabled
  const useFirebase = import.meta.env.VITE_USE_FIREBASE === 'true';
  
  if (!useFirebase) {
    // Use localStorage (current behavior)
    // ... existing localStorage loading code
    return;
  }

  // Subscribe to real-time updates
  const unsubscribers: (() => void)[] = [];

  // Players
  unsubscribers.push(
    firebaseService.subscribeToPlayers((players) => {
      dispatch({ type: 'SET_PLAYERS', payload: players });
    })
  );

  // Auction State
  unsubscribers.push(
    firebaseService.subscribeToAuctionState((state) => {
      dispatch({ type: 'SET_AUCTION_STATE', payload: state });
    })
  );

  // Rosters
  unsubscribers.push(
    firebaseService.subscribeToRosters((rosters) => {
      dispatch({ type: 'LOAD_STATE', payload: { rosters } });
    })
  );

  // Matches
  unsubscribers.push(
    firebaseService.subscribeToMatches((matches) => {
      dispatch({ type: 'LOAD_STATE', payload: { matches } });
    })
  );

  // Auth
  unsubscribers.push(
    firebaseService.subscribeToAuth((user) => {
      dispatch({ type: 'SET_ADMIN', payload: !!user });
    })
  );

  // Cleanup
  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}, []);
```

---

## 12. Deploy to Firebase Hosting

### Step 12.1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 12.2: Login to Firebase

```bash
firebase login
```

### Step 12.3: Initialize Hosting

```bash
firebase init hosting
```

When prompted:
- Select your project: `acc-futsal-league`
- Public directory: `dist`
- Single-page app: `Yes`
- GitHub deploys: `No` (optional)

### Step 12.4: Build the App

```bash
npm run build
```

### Step 12.5: Deploy

```bash
firebase deploy --only hosting
```

Your app will be live at: `https://acc-futsal-league.web.app`

---

## Quick Reference

### Data You Need to Provide Firebase:

| Field | Where to Get |
|-------|--------------|
| API Key | Firebase Console → Project Settings |
| Auth Domain | Firebase Console → Project Settings |
| Project ID | Firebase Console → Project Settings |
| Storage Bucket | Firebase Console → Project Settings |
| Messaging Sender ID | Firebase Console → Project Settings |
| App ID | Firebase Console → Project Settings |

### Admin Credentials:

| Item | Value |
|------|-------|
| Email | (You create in Firebase Auth) |
| Password | (You create in Firebase Auth) |

### Files to Create:

1. `src/lib/firebase.ts` - Firebase initialization
2. `src/services/firebaseService.ts` - Database operations
3. `.env` - Environment variables

### Files to Modify:

1. `src/context/AppContext.tsx` - Add subscriptions

---

## Troubleshooting

### "Permission Denied" Error
- Check Firebase Security Rules
- Ensure user is logged in for write operations

### "Cannot read property" Error
- Make sure `.env` file has correct values
- Restart dev server after changing `.env`

### Data Not Syncing
- Check browser console for errors
- Verify Firestore is enabled in Firebase Console

### Offline Not Working
- IndexedDB persistence requires HTTPS
- Works on localhost but not all browsers

---

## Next Steps After Setup

1. ✅ Test with multiple browser tabs
2. ✅ Test on phone and laptop simultaneously
3. ✅ Create backup of Firestore data
4. ✅ Set up daily backups (Firebase Console → Firestore → Backups)
5. ✅ Monitor usage (Firebase Console → Usage and billing)
