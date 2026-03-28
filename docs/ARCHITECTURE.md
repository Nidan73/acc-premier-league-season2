# 🏗️ Architecture Guide

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        ACC Futsal App                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    React Router                          │   │
│  │  /  /live  /auction  /league  /teams/:id  /admin/*      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    AppContext                            │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ State: players, rosters, auction, matches, logs │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ Actions: dispatch(action) → reducer → newState  │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ Helpers: getRosterStats, canTeamBid, getStandings│   │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 localStorage Persistence                 │   │
│  │  acc_futsal_players, acc_futsal_rosters, etc.           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── AppProvider (Context)
│   └── BrowserRouter
│       ├── HomePage
│       │   └── Navbar
│       ├── LivePage (No Navbar - fullscreen)
│       ├── AuctionPage
│       │   ├── Navbar
│       │   ├── PlayerCard[]
│       │   └── TeamCard[]
│       ├── LeaguePage
│       │   └── Navbar
│       ├── TeamDetailPage
│       │   ├── Navbar
│       │   └── PlayerCard[]
│       └── AdminPage
│           ├── Navbar
│           ├── AuctionTab
│           │   ├── AllSpinners (RandomSpinner[])
│           │   └── TeamCard[]
│           ├── LeagueTab
│           ├── TeamsTab
│           └── DataTab
```

## State Management

### Context + Reducer Pattern

We use React Context with `useReducer` for predictable state updates:

```typescript
// State shape
interface AppState {
  players: Player[];           // All player data
  rosters: TeamRoster[];       // Team → Player[] mapping
  auctionState: AuctionState;  // Current auction phase & bidding
  matches: LeagueMatch[];      // 10 league matches
  finalMatch: FinalMatch;      // Championship match
  teamSettings: TeamSettings;  // Owner names per team
  logs: AuditLog[];            // Activity history
  isAdmin: boolean;            // Auth state
  isLoading: boolean;          // Initial load state
}

// Actions are dispatched to the reducer
dispatch({ type: 'UPDATE_PLAYER', payload: { id, updates } });
dispatch({ type: 'SET_AUCTION_STATE', payload: { phase: 'BIDDING' } });
```

### Data Flow

```
User Action
    │
    ▼
dispatch(action)
    │
    ▼
appReducer(state, action) → newState
    │
    ▼
useEffect syncs to localStorage
    │
    ▼
Components re-render with new state
```

## Storage Service Pattern

### Phase 1: localStorage (Current)

```typescript
const STORAGE_KEYS = {
  PLAYERS: 'acc_futsal_players',
  ROSTERS: 'acc_futsal_rosters',
  AUCTION_STATE: 'acc_futsal_auction',
  MATCHES: 'acc_futsal_matches',
  FINAL: 'acc_futsal_final',
  TEAM_SETTINGS: 'acc_futsal_teams',
  LOGS: 'acc_futsal_logs',
};

// Auto-save on state change
useEffect(() => {
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(state.players));
  // ... other keys
}, [state]);
```

### Phase 2: Firebase (Future)

The same interface can be implemented with Firestore:

```typescript
// Replace localStorage calls with Firestore
async function getPlayers(): Promise<Player[]> {
  const snapshot = await getDocs(collection(db, 'players'));
  return snapshot.docs.map(doc => doc.data() as Player);
}

// Add real-time subscriptions
onSnapshot(collection(db, 'auctionState'), (snapshot) => {
  dispatch({ type: 'SET_AUCTION_STATE', payload: snapshot.data() });
});
```

## Key Design Decisions

### 1. Single Source of Truth
- All state lives in AppContext
- Components read from context, never from localStorage directly
- Mutations only through dispatch

### 2. Computed Values
- `getRosterStats()` calculates squad stats on-demand
- `getStandings()` computes league table from match results
- Never store derived data

### 3. Constraint Validation
- `canTeamBidOnPlayer()` checks all rules before allowing bids
- Validation happens at action time, not in reducer

### 4. Privacy by Design
- Player `private` fields stripped in public components
- Admin-only data never rendered outside `/admin/*`

### 5. Offline-First
- All data persisted to localStorage
- Works without internet (Phase 1)
- Firebase adds sync, not replaces local state

## File Structure

```
src/
├── App.tsx                 # Main app with routing
├── main.tsx                # Entry point
├── index.css               # Tailwind + DaisyUI config
│
├── types/
│   └── index.ts            # TypeScript interfaces
│
├── constants/
│   └── index.ts            # Teams, rules, utilities
│
├── data/
│   └── players.ts          # Initial player data
│
├── context/
│   └── AppContext.tsx      # State management
│
├── components/
│   ├── Navbar.tsx          # Navigation bar
│   ├── PlayerCard.tsx      # Player display card
│   ├── TeamCard.tsx        # Team display card
│   └── RandomSpinner.tsx   # Position-based spinner
│
├── pages/
│   ├── HomePage.tsx
│   ├── LivePage.tsx
│   ├── AuctionPage.tsx
│   ├── LeaguePage.tsx
│   ├── TeamDetailPage.tsx
│   └── AdminPage.tsx
│
└── utils/
    └── cn.ts               # className utility
```

## Performance Considerations

1. **Memoization**: Use `useMemo` for filtered player lists
2. **Lazy Computation**: Standings calculated only when needed
3. **Minimal Re-renders**: Context split by concern in future
4. **localStorage Debounce**: Consider debouncing writes for large state
