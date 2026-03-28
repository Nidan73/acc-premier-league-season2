# 🔥 Phase 2: Firebase Migration Plan

## Why Firebase?

### Current Limitations (localStorage)
- ❌ No real-time sync between devices
- ❌ Live page needs manual refresh
- ❌ Data lost if browser cleared
- ❌ No cloud backup
- ❌ Single-device admin only

### Firebase Benefits
- ✅ Real-time updates across all devices
- ✅ Cloud-stored data (never lost)
- ✅ Multiple admins can control
- ✅ Offline support with sync
- ✅ Security rules for access control
- ✅ Scalable and free tier generous

## Recommended Firebase Services

| Service | Purpose |
|---------|---------|
| **Firestore** | Primary database |
| **Firebase Auth** | Admin authentication |
| **Firebase Hosting** | Deploy the app |

## Firestore Collection Structure

```
acc-futsal/
├── players/
│   ├── {playerId}/
│   │   ├── id: string
│   │   ├── name: string
│   │   ├── category: "MEMBER" | "ALUMNI"
│   │   ├── position: "GK" | "DEF" | "MID" | "FWD"
│   │   ├── strongFoot: string
│   │   ├── pitchMessage: string
│   │   ├── photoUrl: string
│   │   ├── basePrice: number
│   │   ├── status: "AVAILABLE" | "BIDDING" | "SOLD" | "UNSOLD"
│   │   ├── soldToTeamId: string | null
│   │   ├── soldPrice: number | null
│   │   ├── soldAt: timestamp | null
│   │   └── private: { contactNo, email, transactionRef }
│
├── rosters/
│   ├── {teamId}/
│   │   └── playerIds: string[]
│
├── auctionState/
│   └── current/
│       ├── phase: string
│       ├── currentPlayerId: string | null
│       ├── basePrice: number
│       ├── currentBid: number
│       ├── leadingTeamId: string | null
│       ├── bidHistory: array
│       └── updatedAt: timestamp
│
├── matches/
│   ├── {matchId}/
│   │   ├── roundNumber: number
│   │   ├── homeTeamId: string
│   │   ├── awayTeamId: string
│   │   ├── status: string
│   │   ├── homeGoals: number | null
│   │   ├── awayGoals: number | null
│   │   └── updatedAt: timestamp
│
├── finalMatch/
│   └── current/
│       ├── teamAId: string
│       ├── teamBId: string
│       ├── scoreA: number | null
│       ├── scoreB: number | null
│       ├── winnerId: string | null
│       └── status: string
│
├── teamSettings/
│   ├── {teamId}/
│   │   └── ownerName: string
│
└── logs/
    ├── {logId}/
    │   ├── type: string
    │   ├── timestamp: timestamp
    │   └── details: map
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Players - readable by all, writable by admin
    match /players/{playerId} {
      allow read: if true;
      allow write: if isAdmin();
      
      // Never expose private fields to non-admins
      // Handle this in app logic
    }
    
    // Rosters - readable by all, writable by admin
    match /rosters/{teamId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Auction state - readable by all, writable by admin
    match /auctionState/{doc} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Matches - readable by all, writable by admin
    match /matches/{matchId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Final match
    match /finalMatch/{doc} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Team settings
    match /teamSettings/{teamId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Logs - admin only
    match /logs/{logId} {
      allow read, write: if isAdmin();
    }
    
    // Admin list
    match /admins/{userId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow write: if false; // Set manually in console
    }
  }
}
```

## Migration Steps

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: "acc-futsal-league"
3. Enable Firestore Database
4. Enable Authentication (Email/Password)
5. Get config credentials

### Step 2: Install Firebase SDK

```bash
npm install firebase
```

### Step 3: Create Firebase Config

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### Step 4: Add Environment Variables

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 5: Create Firebase Storage Service

```typescript
// src/services/firebaseStorage.ts
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Player, TeamRoster, AuctionState } from '@/types';

export class FirebaseStorageService {
  // Players
  async getPlayers(): Promise<Player[]> {
    const snapshot = await getDocs(collection(db, 'players'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
  }
  
  async updatePlayer(id: string, data: Partial<Player>): Promise<void> {
    await updateDoc(doc(db, 'players', id), data);
  }
  
  // Real-time subscriptions
  subscribeToAuction(callback: (state: AuctionState) => void) {
    return onSnapshot(doc(db, 'auctionState', 'current'), (snapshot) => {
      callback(snapshot.data() as AuctionState);
    });
  }
  
  subscribeToPlayers(callback: (players: Player[]) => void) {
    return onSnapshot(collection(db, 'players'), (snapshot) => {
      const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
      callback(players);
    });
  }
  
  // ... other methods
}
```

### Step 6: Update AppContext

```typescript
// Replace localStorage reads with Firebase
useEffect(() => {
  const unsubscribe = firebaseService.subscribeToAuction((state) => {
    dispatch({ type: 'SET_AUCTION_STATE', payload: state });
  });
  
  return () => unsubscribe();
}, []);

// Replace localStorage writes with Firebase
const updateAuctionState = async (updates: Partial<AuctionState>) => {
  await firebaseService.updateAuctionState(updates);
  // No need to dispatch - subscription handles it
};
```

### Step 7: Add Admin Authentication

```typescript
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const login = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return true;
  } catch (error) {
    return false;
  }
};

const logout = async () => {
  await signOut(auth);
};
```

### Step 8: Migrate Existing Data

```typescript
// One-time migration script
import { INITIAL_PLAYERS } from '@/data/players';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function migrateData() {
  // Migrate players
  for (const player of INITIAL_PLAYERS) {
    await setDoc(doc(db, 'players', player.id), player);
  }
  
  // Migrate other collections...
  console.log('Migration complete!');
}
```

### Step 9: Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## Environment Variables for Firebase

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Estimated Effort

| Task | Time |
|------|------|
| Firebase project setup | 1 hour |
| Install & configure SDK | 1 hour |
| Create storage service | 3-4 hours |
| Update Context for subscriptions | 2-3 hours |
| Add Firebase Auth | 2 hours |
| Testing & debugging | 3-4 hours |
| Data migration | 1 hour |
| Deploy to hosting | 1 hour |
| **Total** | **~15-17 hours** |

## Benefits After Migration

1. **Real-time Live Page**: No more manual refresh
2. **Multiple Admins**: Any authenticated user can control
3. **Cloud Backup**: Data safe from browser issues
4. **Works Offline**: Firebase handles sync when back online
5. **Scales Easily**: Ready for future seasons
6. **Analytics Ready**: Firebase Analytics integration

## Future Enhancements

- Push notifications for bids
- Admin chat/coordination
- Historical stats across seasons
- Player rating system
- Spectator voting/reactions
