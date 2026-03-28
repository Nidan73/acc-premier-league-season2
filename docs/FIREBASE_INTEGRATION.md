# 🔥 Complete Firebase Integration Guide

This comprehensive guide will walk you through integrating Firebase Realtime Database with the ACC Futsal League application.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Create Firebase Project](#step-1-create-firebase-project)
3. [Step 2: Enable Realtime Database](#step-2-enable-realtime-database)
4. [Step 3: Get Firebase Configuration](#step-3-get-firebase-configuration)
5. [Step 4: Install Firebase SDK](#step-4-install-firebase-sdk)
6. [Step 5: Create Firebase Config File](#step-5-create-firebase-config-file)
7. [Step 6: Create Firebase Service](#step-6-create-firebase-service)
8. [Step 7: Update Environment Variables](#step-7-update-environment-variables)
9. [Step 8: Set Security Rules](#step-8-set-security-rules)
10. [Step 9: Initialize Database with Data](#step-9-initialize-database-with-data)
11. [Step 10: Update AppContext for Real-time](#step-10-update-appcontext-for-real-time)
12. [Step 11: Deploy to Firebase Hosting](#step-11-deploy-to-firebase-hosting)
13. [Database Structure Reference](#database-structure-reference)
14. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:
- ✅ A Google account
- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager
- ✅ The project running locally

---

## Step 1: Create Firebase Project

### 1.1 Go to Firebase Console
Open your browser and navigate to:
```
https://console.firebase.google.com/
```

### 1.2 Create New Project
1. Click **"Create a project"** (or "Add project")
2. Enter project name: `acc-futsal-league` (or any name you prefer)
3. Click **Continue**
4. (Optional) Enable/disable Google Analytics - not required for this app
5. Click **Create project**
6. Wait for project creation, then click **Continue**

### 1.3 You're in the Firebase Console! 🎉

---

## Step 2: Enable Realtime Database

### 2.1 Navigate to Realtime Database
1. In the left sidebar, click **Build** → **Realtime Database**
2. Click **Create Database**

### 2.2 Choose Database Location
1. Select a location closest to your users (e.g., `Singapore (asia-southeast1)` for Bangladesh)
2. Click **Next**

### 2.3 Choose Security Rules
1. Select **Start in test mode** (we'll secure it later)
2. Click **Enable**

### 2.4 Your database is ready! 
You'll see a URL like:
```
https://acc-futsal-league-default-rtdb.asia-southeast1.firebasedatabase.app/
```
**Save this URL - you'll need it later!**

---

## Step 3: Get Firebase Configuration

### 3.1 Register Your Web App
1. Click the **gear icon** ⚙️ next to "Project Overview"
2. Click **Project settings**
3. Scroll down to "Your apps" section
4. Click the **Web icon** `</>`

### 3.2 Register App
1. Enter app nickname: `ACC Futsal Web`
2. (Optional) Check "Also set up Firebase Hosting"
3. Click **Register app**

### 3.3 Copy Configuration
You'll see a code block like this - **copy these values**:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD.....................",
  authDomain: "acc-futsal-league.firebaseapp.com",
  databaseURL: "https://acc-futsal-league-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "acc-futsal-league",
  storageBucket: "acc-futsal-league.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

**⚠️ IMPORTANT: Save all these values! You'll need them for `.env` file.**

Click **Continue to console**

---

## Step 4: Install Firebase SDK

Open your terminal in the project folder and run:

```bash
npm install firebase
```

This installs the Firebase JavaScript SDK.

---

## Step 5: Create Firebase Config File

Create a new file `src/lib/firebase.ts`:

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, update, remove, onValue, push, child } from 'firebase/database';

// Firebase configuration from environment variables
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

// Get database instance
export const database = getDatabase(app);

// Database references
export const dbRefs = {
  players: () => ref(database, 'players'),
  player: (id: string) => ref(database, `players/${id}`),
  rosters: () => ref(database, 'rosters'),
  roster: (teamId: string) => ref(database, `rosters/${teamId}`),
  auctionState: () => ref(database, 'auctionState'),
  matches: () => ref(database, 'matches'),
  match: (id: string) => ref(database, `matches/${id}`),
  finalMatch: () => ref(database, 'finalMatch'),
  teamSettings: () => ref(database, 'teamSettings'),
  teamSetting: (teamId: string) => ref(database, `teamSettings/${teamId}`),
  logs: () => ref(database, 'logs'),
};

// Export Firebase utilities
export { ref, set, get, update, remove, onValue, push, child };
export default app;
```

---

## Step 6: Create Firebase Service

Create a new file `src/services/firebaseService.ts`:

```typescript
// src/services/firebaseService.ts
import { database, dbRefs, set, get, update, onValue, push } from '@/lib/firebase';
import type { Player, TeamRoster, AuctionState, LeagueMatch, FinalMatch, AuditLog, TeamId } from '@/types';

/**
 * Firebase Realtime Database Service
 * Handles all database operations with real-time subscriptions
 */

// ===== PLAYERS =====

export async function getPlayers(): Promise<Player[]> {
  const snapshot = await get(dbRefs.players());
  if (!snapshot.exists()) return [];
  
  const data = snapshot.val();
  return Object.keys(data).map(key => ({ ...data[key], id: key }));
}

export async function updatePlayer(id: string, updates: Partial<Player>): Promise<void> {
  await update(dbRefs.player(id), updates);
}

export function subscribeToPlayers(callback: (players: Player[]) => void): () => void {
  const unsubscribe = onValue(dbRefs.players(), (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.val();
    const players = Object.keys(data).map(key => ({ ...data[key], id: key }));
    callback(players);
  });
  
  return unsubscribe;
}

// ===== ROSTERS =====

export async function getRosters(): Promise<TeamRoster[]> {
  const snapshot = await get(dbRefs.rosters());
  if (!snapshot.exists()) return [];
  
  const data = snapshot.val();
  return Object.keys(data).map(key => ({
    teamId: key as TeamId,
    playerIds: data[key].playerIds || [],
  }));
}

export async function updateRoster(teamId: TeamId, playerIds: string[]): Promise<void> {
  await update(dbRefs.roster(teamId), { playerIds });
}

export async function addPlayerToTeam(teamId: TeamId, playerId: string): Promise<void> {
  const snapshot = await get(dbRefs.roster(teamId));
  const current = snapshot.exists() ? snapshot.val().playerIds || [] : [];
  
  if (!current.includes(playerId)) {
    await update(dbRefs.roster(teamId), { playerIds: [...current, playerId] });
  }
}

export async function removePlayerFromTeam(teamId: TeamId, playerId: string): Promise<void> {
  const snapshot = await get(dbRefs.roster(teamId));
  const current = snapshot.exists() ? snapshot.val().playerIds || [] : [];
  
  await update(dbRefs.roster(teamId), { 
    playerIds: current.filter((id: string) => id !== playerId) 
  });
}

export function subscribeToRosters(callback: (rosters: TeamRoster[]) => void): () => void {
  const unsubscribe = onValue(dbRefs.rosters(), (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.val();
    const rosters = Object.keys(data).map(key => ({
      teamId: key as TeamId,
      playerIds: data[key].playerIds || [],
    }));
    callback(rosters);
  });
  
  return unsubscribe;
}

// ===== AUCTION STATE =====

export async function getAuctionState(): Promise<AuctionState | null> {
  const snapshot = await get(dbRefs.auctionState());
  return snapshot.exists() ? snapshot.val() : null;
}

export async function updateAuctionState(updates: Partial<AuctionState>): Promise<void> {
  await update(dbRefs.auctionState(), {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export function subscribeToAuctionState(callback: (state: AuctionState | null) => void): () => void {
  const unsubscribe = onValue(dbRefs.auctionState(), (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
  
  return unsubscribe;
}

// ===== MATCHES =====

export async function getMatches(): Promise<LeagueMatch[]> {
  const snapshot = await get(dbRefs.matches());
  if (!snapshot.exists()) return [];
  
  const data = snapshot.val();
  return Object.keys(data).map(key => ({ ...data[key], id: key }));
}

export async function updateMatch(id: string, updates: Partial<LeagueMatch>): Promise<void> {
  await update(dbRefs.match(id), {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export function subscribeToMatches(callback: (matches: LeagueMatch[]) => void): () => void {
  const unsubscribe = onValue(dbRefs.matches(), (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.val();
    const matches = Object.keys(data).map(key => ({ ...data[key], id: key }));
    callback(matches);
  });
  
  return unsubscribe;
}

// ===== FINAL MATCH =====

export async function getFinalMatch(): Promise<FinalMatch | null> {
  const snapshot = await get(dbRefs.finalMatch());
  return snapshot.exists() ? snapshot.val() : null;
}

export async function updateFinalMatch(updates: Partial<FinalMatch>): Promise<void> {
  await update(dbRefs.finalMatch(), updates);
}

export function subscribeToFinalMatch(callback: (match: FinalMatch | null) => void): () => void {
  const unsubscribe = onValue(dbRefs.finalMatch(), (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
  
  return unsubscribe;
}

// ===== TEAM SETTINGS =====

export async function getTeamSettings(): Promise<Record<TeamId, { ownerName: string }>> {
  const snapshot = await get(dbRefs.teamSettings());
  return snapshot.exists() ? snapshot.val() : {};
}

export async function updateTeamOwner(teamId: TeamId, ownerName: string): Promise<void> {
  await update(dbRefs.teamSetting(teamId), { ownerName });
}

export function subscribeToTeamSettings(
  callback: (settings: Record<TeamId, { ownerName: string }>) => void
): () => void {
  const unsubscribe = onValue(dbRefs.teamSettings(), (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : {});
  });
  
  return unsubscribe;
}

// ===== AUDIT LOGS =====

export async function addLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
  const newLogRef = push(dbRefs.logs());
  await set(newLogRef, {
    ...log,
    timestamp: new Date().toISOString(),
  });
}

export async function getLogs(limit = 100): Promise<AuditLog[]> {
  const snapshot = await get(dbRefs.logs());
  if (!snapshot.exists()) return [];
  
  const data = snapshot.val();
  return Object.keys(data)
    .map(key => ({ ...data[key], id: key }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function subscribeToLogs(callback: (logs: AuditLog[]) => void): () => void {
  const unsubscribe = onValue(dbRefs.logs(), (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.val();
    const logs = Object.keys(data)
      .map(key => ({ ...data[key], id: key }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    callback(logs);
  });
  
  return unsubscribe;
}

// ===== BULK OPERATIONS =====

export async function initializeDatabase(data: {
  players: Player[];
  rosters: TeamRoster[];
  auctionState: AuctionState;
  matches: LeagueMatch[];
  teamSettings: Record<TeamId, { ownerName: string }>;
}): Promise<void> {
  // Convert arrays to objects with IDs as keys
  const playersObj: Record<string, Player> = {};
  data.players.forEach(p => { playersObj[p.id] = p; });
  
  const rostersObj: Record<string, { playerIds: string[] }> = {};
  data.rosters.forEach(r => { rostersObj[r.teamId] = { playerIds: r.playerIds }; });
  
  const matchesObj: Record<string, LeagueMatch> = {};
  data.matches.forEach(m => { matchesObj[m.id] = m; });
  
  await set(dbRefs.players(), playersObj);
  await set(dbRefs.rosters(), rostersObj);
  await set(dbRefs.auctionState(), data.auctionState);
  await set(dbRefs.matches(), matchesObj);
  await set(dbRefs.teamSettings(), data.teamSettings);
}

export async function exportAllData(): Promise<{
  players: Player[];
  rosters: TeamRoster[];
  auctionState: AuctionState | null;
  matches: LeagueMatch[];
  finalMatch: FinalMatch | null;
  teamSettings: Record<TeamId, { ownerName: string }>;
  logs: AuditLog[];
}> {
  const [players, rosters, auctionState, matches, finalMatch, teamSettings, logs] = await Promise.all([
    getPlayers(),
    getRosters(),
    getAuctionState(),
    getMatches(),
    getFinalMatch(),
    getTeamSettings(),
    getLogs(1000),
  ]);
  
  return { players, rosters, auctionState, matches, finalMatch, teamSettings, logs };
}
```

---

## Step 7: Update Environment Variables

### 7.1 Create `.env` File
Create a `.env` file in your project root:

```env
# Admin Passcode (change this!)
VITE_ADMIN_PASSCODE=847291

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyD...your-api-key
VITE_FIREBASE_AUTH_DOMAIN=acc-futsal-league.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://acc-futsal-league-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=acc-futsal-league
VITE_FIREBASE_STORAGE_BUCKET=acc-futsal-league.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
```

### 7.2 Replace with Your Values
Replace each value with the ones you copied from Firebase Console in Step 3.

**⚠️ IMPORTANT: Never commit `.env` to git! It's already in `.gitignore`.**

---

## Step 8: Set Security Rules

### 8.1 Go to Database Rules
1. In Firebase Console, go to **Realtime Database**
2. Click the **Rules** tab

### 8.2 Set Production Rules
Replace the default rules with these:

```json
{
  "rules": {
    // Public read access for live displays
    "players": {
      ".read": true,
      ".write": "auth != null"
    },
    "rosters": {
      ".read": true,
      ".write": "auth != null"
    },
    "auctionState": {
      ".read": true,
      ".write": "auth != null"
    },
    "matches": {
      ".read": true,
      ".write": "auth != null"
    },
    "finalMatch": {
      ".read": true,
      ".write": "auth != null"
    },
    "teamSettings": {
      ".read": true,
      ".write": "auth != null"
    },
    "logs": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### 8.3 For Development (Test Mode)
For testing, you can use these rules (less secure):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**⚠️ WARNING: Only use test rules during development!**

Click **Publish** to save the rules.

---

## Step 9: Initialize Database with Data

### 9.1 Create Initialization Script
Create a file `scripts/initFirebase.ts`:

```typescript
// scripts/initFirebase.ts
// Run this once to populate Firebase with initial data

import { INITIAL_PLAYERS } from '../src/data/players';
import { generateInitialMatches } from '../src/constants';

const initialData = {
  players: INITIAL_PLAYERS,
  rosters: [
    { teamId: 'rabies', playerIds: ['member-007'] },
    { teamId: 'meow', playerIds: ['member-010'] },
    { teamId: 'nazi', playerIds: ['member-002'] },
    { teamId: 'goaldiggers', playerIds: ['member-013'] },
    { teamId: 'crazy', playerIds: ['alumni-001'] },
  ],
  auctionState: {
    phase: 'NOT_STARTED',
    currentPlayerId: null,
    basePrice: 0,
    currentBid: 0,
    leadingTeamId: null,
    bidHistory: [],
    updatedAt: new Date().toISOString(),
    lastSoldLogId: null,
  },
  matches: generateInitialMatches(),
  teamSettings: {
    rabies: { ownerName: 'Hossain Sami' },
    meow: { ownerName: 'Ashik' },
    nazi: { ownerName: 'Purnandu Bikash Das' },
    goaldiggers: { ownerName: 'MD. Musfique Mortuza Sadid' },
    crazy: { ownerName: 'Fardin Rahman' },
  },
};

console.log('Initial data to import:', JSON.stringify(initialData, null, 2));
```

### 9.2 Manual Import via Firebase Console
1. Go to **Realtime Database** in Firebase Console
2. Click on the database URL (root)
3. Click the **⋮** menu → **Import JSON**
4. Upload a JSON file with the structure from Step 9.1

Alternatively, you can add an "Initialize Database" button in the admin panel.

---

## Step 10: Update AppContext for Real-time

Replace `src/context/AppContext.tsx` subscriptions:

```typescript
// In useEffect, replace localStorage loading with Firebase subscriptions

useEffect(() => {
  // Subscribe to all data sources
  const unsubscribers: (() => void)[] = [];
  
  unsubscribers.push(
    subscribeToPlayers((players) => {
      dispatch({ type: 'SET_PLAYERS', payload: players });
    })
  );
  
  unsubscribers.push(
    subscribeToRosters((rosters) => {
      dispatch({ type: 'LOAD_STATE', payload: { rosters } });
    })
  );
  
  unsubscribers.push(
    subscribeToAuctionState((auctionState) => {
      if (auctionState) {
        dispatch({ type: 'SET_AUCTION_STATE', payload: auctionState });
      }
    })
  );
  
  unsubscribers.push(
    subscribeToMatches((matches) => {
      dispatch({ type: 'LOAD_STATE', payload: { matches } });
    })
  );
  
  // Cleanup on unmount
  return () => {
    unsubscribers.forEach(unsub => unsub());
  };
}, []);
```

---

## Step 11: Deploy to Firebase Hosting

### 11.1 Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 11.2 Login to Firebase
```bash
firebase login
```

### 11.3 Initialize Firebase in Project
```bash
firebase init
```

Select:
- **Hosting**: Configure files for Firebase Hosting
- Use existing project: `acc-futsal-league`
- Public directory: `dist`
- Configure as single-page app: **Yes**
- Set up GitHub deploys: **No** (optional)
- Overwrite dist/index.html: **No**

### 11.4 Build and Deploy
```bash
npm run build
firebase deploy
```

Your app is now live! 🎉

---

## Database Structure Reference

```
acc-futsal-league-default-rtdb/
├── players/
│   ├── member-001/
│   │   ├── id: "member-001"
│   │   ├── name: "Tanbeen Taheer Pranta"
│   │   ├── category: "MEMBER"
│   │   ├── position: "FWD"
│   │   ├── strongFoot: "Right"
│   │   ├── pitchMessage: "..."
│   │   ├── photoUrl: "https://..."
│   │   ├── basePrice: 10000
│   │   ├── status: "AVAILABLE" | "SOLD" | "UNSOLD" | "BIDDING"
│   │   ├── soldToTeamId: null | "rabies" | "meow" | ...
│   │   ├── soldPrice: null | number
│   │   ├── soldAt: null | "ISO timestamp"
│   │   └── private/
│   │       ├── contactNo: "..."
│   │       ├── email: "..."
│   │       └── transactionRef: "..."
│   └── member-002/
│       └── ...
│
├── rosters/
│   ├── rabies/
│   │   └── playerIds: ["member-007", ...]
│   ├── meow/
│   │   └── playerIds: ["member-010", ...]
│   ├── nazi/
│   │   └── playerIds: ["member-002", ...]
│   ├── goaldiggers/
│   │   └── playerIds: ["member-013", ...]
│   └── crazy/
│       └── playerIds: ["alumni-001", ...]
│
├── auctionState/
│   ├── phase: "NOT_STARTED" | "IDLE" | "BIDDING" | "PAUSED" | "COMPLETED"
│   ├── currentPlayerId: null | "player-id"
│   ├── basePrice: 0
│   ├── currentBid: 0
│   ├── leadingTeamId: null | "team-id"
│   ├── bidHistory: [...]
│   ├── updatedAt: "ISO timestamp"
│   └── lastSoldLogId: null | "log-id"
│
├── matches/
│   ├── R1-M1/
│   │   ├── id: "R1-M1"
│   │   ├── roundNumber: 1
│   │   ├── homeTeamId: "rabies"
│   │   ├── awayTeamId: "meow"
│   │   ├── status: "SCHEDULED" | "LIVE" | "COMPLETED"
│   │   ├── homeGoals: null | number
│   │   ├── awayGoals: null | number
│   │   └── ...
│   └── R1-M2/
│       └── ...
│
├── finalMatch/
│   ├── id: "FINAL"
│   ├── teamAId: null | "team-id"
│   ├── teamBId: null | "team-id"
│   ├── status: "PENDING" | "SCHEDULED" | "LIVE" | "COMPLETED"
│   └── ...
│
├── teamSettings/
│   ├── rabies/
│   │   └── ownerName: "Hossain Sami"
│   ├── meow/
│   │   └── ownerName: "Ashik"
│   └── ...
│
└── logs/
    ├── -NxABC123/
    │   ├── type: "PLAYER_SOLD"
    │   ├── timestamp: "ISO timestamp"
    │   └── details: {...}
    └── ...
```

---

## Troubleshooting

### Common Issues

#### 1. "Permission denied" error
- Check your security rules in Firebase Console
- Make sure you're authenticated if rules require auth
- For development, temporarily use test mode rules

#### 2. "Firebase not initialized" error
- Verify all environment variables are set in `.env`
- Restart the dev server after changing `.env`
- Check for typos in variable names

#### 3. Data not syncing in real-time
- Check browser console for errors
- Verify the database URL is correct
- Make sure you're subscribed to the correct paths

#### 4. Images not loading
- Google Drive links are converted automatically
- Make sure the Drive files are shared publicly
- Check if the file ID is correct

### Debug Tips

1. **Check Firebase Console Data Viewer** - See real-time data changes
2. **Enable verbose logging** - Add `firebase.database.enableLogging(true)`
3. **Use browser DevTools** - Network tab shows Firebase requests
4. **Check Rules Playground** - Test security rules before publishing

---

## Quick Reference Card

| Task | Command/Action |
|------|----------------|
| Install Firebase | `npm install firebase` |
| Install CLI | `npm install -g firebase-tools` |
| Login | `firebase login` |
| Initialize | `firebase init` |
| Build | `npm run build` |
| Deploy | `firebase deploy` |
| View logs | Firebase Console → Functions → Logs |

---

## Need Help?

1. **Firebase Documentation**: https://firebase.google.com/docs
2. **Realtime Database Docs**: https://firebase.google.com/docs/database
3. **Security Rules**: https://firebase.google.com/docs/database/security

---

*Created for ACC Futsal League - Season 2*
