/**
 * AppContext - Global State Management with Firebase Realtime Database
 *
 * This context provides real-time data synchronization across all clients.
 * When admin makes changes, all spectators see updates instantly.
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type {
  Player,
  Team,
  TeamRoster,
  AuctionState,
  LeagueMatch,
  FinalMatch,
  AuditLog,
  TeamId,
  PlayerPosition,
  PlayerCategory,
} from "../types";
import { INITIAL_PLAYERS } from "../data/players";
import * as firebaseService from "../services/firebaseService";

// ============================================
// TYPES
// ============================================

interface AppState {
  // Data
  players: Player[];
  teams: Team[];
  rosters: TeamRoster[];
  auctionState: AuctionState;
  matches: LeagueMatch[];
  finalMatch: FinalMatch | null;
  auditLogs: AuditLog[];

  // UI State
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  isAdmin: boolean;
}

type AppAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_INITIALIZED"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_ADMIN"; payload: boolean }
  | { type: "SET_PLAYERS"; payload: Player[] }
  | { type: "SET_TEAMS"; payload: Team[] }
  | { type: "SET_ROSTERS"; payload: TeamRoster[] }
  | { type: "SET_AUCTION_STATE"; payload: AuctionState }
  | { type: "SET_MATCHES"; payload: LeagueMatch[] }
  | { type: "SET_FINAL_MATCH"; payload: FinalMatch | null }
  | { type: "SET_AUDIT_LOGS"; payload: AuditLog[] }
  | { type: "RESET_STATE" };

interface AppContextValue extends AppState {
  // Auth
  login: (passcode: string) => boolean;
  logout: () => void;

  // Auction Actions
  startAuction: () => Promise<void>;
  stopAuction: () => Promise<void>;
  startBidding: (playerId: string) => Promise<void>;
  cancelBidding: () => Promise<void>;
  placeBid: (teamId: TeamId) => Promise<void>;
  sellPlayer: () => Promise<void>;
  markUnsold: () => Promise<void>;
  undoLastSale: () => Promise<void>;
  pauseAuction: () => Promise<void>;
  resumeAuction: () => Promise<void>;
  completeAuction: () => Promise<void>;
  reAuctionPlayer: (playerId: string) => Promise<void>;

  // Team Actions
  updateTeamOwner: (teamId: TeamId, ownerName: string) => Promise<void>;
  removePlayerFromTeam: (teamId: TeamId, playerId: string) => Promise<void>;

  // Match Actions
  updateMatchScore: (
    matchId: string,
    homeGoals: number,
    awayGoals: number,
  ) => Promise<void>;
  resetMatchScore: (matchId: string) => Promise<void>;
  updateFinalScore: (scoreA: number, scoreB: number) => Promise<void>;
  resetFinalMatch: () => Promise<void>;

  // Data Actions
  initializeFirebase: () => Promise<void>;
  resetAllData: () => Promise<void>;
  resetAuctionData: () => Promise<void>;
  resetLeagueData: () => Promise<void>;

  // Helper functions
  getTeamById: (teamId: TeamId) => Team | undefined;
  getPlayerById: (playerId: string) => Player | undefined;
  getTeamRoster: (teamId: TeamId) => Player[];
  getTeamBudget: (teamId: TeamId) => {
    total: number;
    spent: number;
    remaining: number;
  };
  getTeamConstraints: (teamId: TeamId) => {
    playerCount: number;
    gkCount: number;
    alumniCount: number;
    canAddPlayer: boolean;
    canAddGK: boolean;
    canAddAlumni: boolean;
  };
  canTeamBidOnPlayer: (
    teamId: TeamId,
    player: Player,
    nextBid: number,
  ) => { allowed: boolean; reason?: string };
  getNextBidAmount: () => number;
  getBidIncrement: (currentBid: number) => number;
  getAvailablePlayers: () => Player[];
  getPlayersByPosition: (position: PlayerPosition) => Player[];
  getPlayersByCategory: (category: PlayerCategory) => Player[];
  getSoldPlayers: () => Player[];
  getUnsoldPlayers: () => Player[];
}

// ============================================
// INITIAL DATA
// ============================================

const INITIAL_TEAMS: Team[] = [
  {
    id: "rabies",
    name: "Team Rabies",
    shortName: "RAB",
    ownerName: "Sami",
    colorPrimary: "#DC2626",
    colorSecondary: "#FEE2E2",
    logoEmoji: "🦊",
    budget: 150000,
  },
  {
    id: "meow",
    name: "Meow - meoW FC",
    shortName: "MEW",
    ownerName: "Ashik",
    colorPrimary: "#7C3AED",
    colorSecondary: "#EDE9FE",
    logoEmoji: "🐱",
    budget: 150000,
  },
  {
    id: "nazi",
    name: "Team Nazi",
    shortName: "NAZ",
    ownerName: "Bkash (Purnandu)",
    colorPrimary: "#059669",
    colorSecondary: "#D1FAE5",
    logoEmoji: "⚡",
    budget: 150000,
  },
  {
    id: "goaldiggers",
    name: "Goal Diggers",
    shortName: "GDG",
    ownerName: "Sadid",
    colorPrimary: "#D97706",
    colorSecondary: "#FEF3C7",
    logoEmoji: "⛏️",
    budget: 150000,
  },
  {
    id: "crazy",
    name: "Team Crazy",
    shortName: "CRZ",
    ownerName: "Fardin",
    colorPrimary: "#2563EB",
    colorSecondary: "#DBEAFE",
    logoEmoji: "🤪",
    budget: 150000,
  },
];

const INITIAL_ROSTERS: TeamRoster[] = [
  { teamId: "rabies", playerIds: ["member-007"] }, // Hossain Sami
  { teamId: "meow", playerIds: ["member-010"] }, // Ashik
  { teamId: "nazi", playerIds: ["member-002"] }, // Purnandu Bikash Das
  { teamId: "goaldiggers", playerIds: ["member-013"] }, // Sadid
  { teamId: "crazy", playerIds: ["alumni-001"] }, // Fardin Rahman
];

const INITIAL_AUCTION_STATE: AuctionState = {
  phase: "NOT_STARTED",
  currentPlayerId: null,
  basePrice: 0,
  currentBid: 0,
  leadingTeamId: null,
  bidHistory: [],
  updatedAt: new Date().toISOString(),
  lastSoldLogId: null,
};

const LEAGUE_FIXTURE: { round: number; home: TeamId; away: TeamId }[] = [
  { round: 1, home: "rabies", away: "meow" },
  { round: 1, home: "nazi", away: "goaldiggers" },
  { round: 2, home: "crazy", away: "rabies" },
  { round: 2, home: "meow", away: "nazi" },
  { round: 3, home: "goaldiggers", away: "crazy" },
  { round: 3, home: "rabies", away: "nazi" },
  { round: 4, home: "meow", away: "goaldiggers" },
  { round: 4, home: "nazi", away: "crazy" },
  { round: 5, home: "crazy", away: "meow" },
  { round: 5, home: "goaldiggers", away: "rabies" },
];

const INITIAL_MATCHES: LeagueMatch[] = LEAGUE_FIXTURE.map((fixture, index) => ({
  id: `R${fixture.round}-M${(index % 2) + 1}`,
  roundNumber: fixture.round as 1 | 2 | 3 | 4 | 5,
  homeTeamId: fixture.home,
  awayTeamId: fixture.away,
  status: "SCHEDULED" as const,
  homeGoals: null,
  awayGoals: null,
  scheduledAt: null,
  venue: null,
  updatedAt: new Date().toISOString(),
}));

const INITIAL_STATE: AppState = {
  players: INITIAL_PLAYERS,
  teams: INITIAL_TEAMS,
  rosters: INITIAL_ROSTERS,
  auctionState: INITIAL_AUCTION_STATE,
  matches: INITIAL_MATCHES,
  finalMatch: null,
  auditLogs: [],
  isLoading: true,
  isInitialized: false,
  error: null,
  isAdmin: false,
};

// ============================================
// REDUCER
// ============================================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_INITIALIZED":
      return { ...state, isInitialized: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_ADMIN":
      return { ...state, isAdmin: action.payload };
    case "SET_PLAYERS":
      return { ...state, players: action.payload };
    case "SET_TEAMS":
      return { ...state, teams: action.payload };
    case "SET_ROSTERS":
      return { ...state, rosters: action.payload };
    case "SET_AUCTION_STATE":
      return { ...state, auctionState: action.payload };
    case "SET_MATCHES":
      return { ...state, matches: action.payload };
    case "SET_FINAL_MATCH":
      return { ...state, finalMatch: action.payload };
    case "SET_AUDIT_LOGS":
      return { ...state, auditLogs: action.payload };
    case "RESET_STATE":
      return { ...INITIAL_STATE, isLoading: false, isInitialized: true };
    default:
      return state;
  }
}

// ============================================
// CONTEXT
// ============================================

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

// ============================================
// PROVIDER
// ============================================

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);
  const [unsubscribers, setUnsubscribers] = useState<(() => void)[]>([]);

  // ============================================
  // FIREBASE INITIALIZATION
  // ============================================

  const initializeFirebase = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      console.log("🔥 Initializing Firebase connection...");

      // Check if data exists in Firebase
      let isInitialized = false;
      try {
        isInitialized = await firebaseService.isDataInitialized();
        console.log("✅ Firebase connected! Data initialized:", isInitialized);
      } catch (error) {
        console.error("❌ Firebase read error - check your rules!", error);
        throw new Error(
          'Firebase read permission denied. Please set ".read": true in your Firebase rules.',
        );
      }

      if (!isInitialized) {
        // First time - upload initial data to Firebase
        console.log("Initializing Firebase with initial data...");
        await firebaseService.initializeAllData({
          players: INITIAL_PLAYERS,
          teams: INITIAL_TEAMS,
          rosters: INITIAL_ROSTERS,
          auctionState: INITIAL_AUCTION_STATE,
          matches: INITIAL_MATCHES,
          finalMatch: null,
        });
        console.log("Firebase initialized successfully!");
      }

      // Set up real-time subscriptions
      const unsubs: (() => void)[] = [];

      // Subscribe to players
      console.log("📡 Setting up real-time subscriptions...");

      unsubs.push(
        firebaseService.subscribeToPlayers((players) => {
          console.log("👥 Players updated:", players.length);
          dispatch({ type: "SET_PLAYERS", payload: players });
        }),
      );

      // Subscribe to teams
      unsubs.push(
        firebaseService.subscribeToTeams((teams) => {
          console.log("🏆 Teams updated:", teams.length);
          dispatch({ type: "SET_TEAMS", payload: teams });
        }),
      );

      // Subscribe to rosters
      unsubs.push(
        firebaseService.subscribeToRosters((rosters) => {
          console.log("📋 Rosters updated:", rosters.length);
          dispatch({ type: "SET_ROSTERS", payload: rosters });
        }),
      );

      // Subscribe to auction state
      unsubs.push(
        firebaseService.subscribeToAuctionState((auctionState) => {
          console.log("🎯 Auction state updated:", auctionState?.phase);
          if (auctionState) {
            dispatch({ type: "SET_AUCTION_STATE", payload: auctionState });
          }
        }),
      );

      // Subscribe to matches
      unsubs.push(
        firebaseService.subscribeToMatches((matches) => {
          console.log("⚽ Matches updated:", matches.length);
          dispatch({ type: "SET_MATCHES", payload: matches });
        }),
      );

      // Subscribe to final match
      unsubs.push(
        firebaseService.subscribeToFinalMatch((finalMatch) => {
          console.log("🏅 Final match updated:", finalMatch);
          dispatch({ type: "SET_FINAL_MATCH", payload: finalMatch });
        }),
      );

      // Subscribe to audit logs
      unsubs.push(
        firebaseService.subscribeToAuditLogs((logs) => {
          console.log("📝 Audit logs updated:", logs.length);
          dispatch({ type: "SET_AUDIT_LOGS", payload: logs });
        }),
      );

      setUnsubscribers(unsubs);
      dispatch({ type: "SET_INITIALIZED", payload: true });
      dispatch({ type: "SET_LOADING", payload: false });
    } catch (error) {
      console.error("Firebase initialization error:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to connect to database. Using local data.",
      });
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeFirebase();

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [initializeFirebase]);

  // ============================================
  // AUTH
  // ============================================

  const login = useCallback((passcode: string): boolean => {
    const correctPasscode = import.meta.env.VITE_ADMIN_PASSCODE || "847291";
    if (passcode === correctPasscode) {
      dispatch({ type: "SET_ADMIN", payload: true });
      sessionStorage.setItem("acc_admin_auth", "true");
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: "SET_ADMIN", payload: false });
    sessionStorage.removeItem("acc_admin_auth");
  }, []);

  // Check session on mount
  useEffect(() => {
    const isAuth = sessionStorage.getItem("acc_admin_auth") === "true";
    if (isAuth) {
      dispatch({ type: "SET_ADMIN", payload: true });
    }
  }, []);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getTeamById = useCallback(
    (teamId: TeamId): Team | undefined => {
      return state.teams.find((t) => t.id === teamId);
    },
    [state.teams],
  );

  const getPlayerById = useCallback(
    (playerId: string): Player | undefined => {
      return state.players.find((p) => p.id === playerId);
    },
    [state.players],
  );

  const getTeamRoster = useCallback(
    (teamId: TeamId): Player[] => {
      const roster = state.rosters.find((r) => r.teamId === teamId);
      if (!roster) return [];
      return roster.playerIds
        .map((id) => state.players.find((p) => p.id === id))
        .filter(Boolean) as Player[];
    },
    [state.rosters, state.players],
  );

  const getTeamBudget = useCallback(
    (teamId: TeamId): { total: number; spent: number; remaining: number } => {
      const roster = getTeamRoster(teamId);
      const spent = roster.reduce(
        (sum, player) => sum + (player.soldPrice || 0),
        0,
      );
      return { total: 150000, spent, remaining: 150000 - spent };
    },
    [getTeamRoster],
  );

  const getTeamConstraints = useCallback(
    (
      teamId: TeamId,
    ): {
      playerCount: number;
      gkCount: number;
      alumniCount: number;
      canAddPlayer: boolean;
      canAddGK: boolean;
      canAddAlumni: boolean;
    } => {
      const roster = getTeamRoster(teamId);
      const playerCount = roster.length;
      const gkCount = roster.filter((p) => p.position === "GK").length;
      const alumniCount = roster.filter((p) => p.category === "ALUMNI").length;

      return {
        playerCount,
        gkCount,
        alumniCount,
        canAddPlayer: playerCount < 8,
        canAddGK: gkCount < 1,
        canAddAlumni: alumniCount < 1,
      };
    },
    [getTeamRoster],
  );

  const getBidIncrement = useCallback((currentBid: number): number => {
    return currentBid < 10000 ? 1000 : 2000;
  }, []);

  const getNextBidAmount = useCallback((): number => {
    const { currentBid, basePrice } = state.auctionState;
    if (currentBid === 0) return basePrice;
    return currentBid + getBidIncrement(currentBid);
  }, [state.auctionState, getBidIncrement]);

  const canTeamBidOnPlayer = useCallback(
    (
      teamId: TeamId,
      player: Player,
      nextBid: number,
    ): { allowed: boolean; reason?: string } => {
      const constraints = getTeamConstraints(teamId);
      const budget = getTeamBudget(teamId);

      if (constraints.playerCount >= 8) {
        return { allowed: false, reason: "Team already has 8 players (max)" };
      }
      if (player.category === "ALUMNI" && !constraints.canAddAlumni) {
        return { allowed: false, reason: "Team already has 1 Alumni (max)" };
      }
      if (player.position === "GK" && !constraints.canAddGK) {
        return { allowed: false, reason: "Team already has 1 GK (max)" };
      }
      if (nextBid > budget.remaining) {
        return {
          allowed: false,
          reason: `Insufficient budget (৳${budget.remaining.toLocaleString()} remaining)`,
        };
      }
      return { allowed: true };
    },
    [getTeamConstraints, getTeamBudget],
  );

  const getAvailablePlayers = useCallback((): Player[] => {
    return state.players.filter(
      (p) => p.status === "AVAILABLE" || p.status === "UNSOLD",
    );
  }, [state.players]);

  const getPlayersByPosition = useCallback(
    (position: PlayerPosition): Player[] => {
      return state.players.filter(
        (p) =>
          p.position === position &&
          (p.status === "AVAILABLE" || p.status === "UNSOLD"),
      );
    },
    [state.players],
  );

  const getPlayersByCategory = useCallback(
    (category: PlayerCategory): Player[] => {
      return state.players.filter(
        (p) =>
          p.category === category &&
          (p.status === "AVAILABLE" || p.status === "UNSOLD"),
      );
    },
    [state.players],
  );

  // ============================================
  // AUCTION ACTIONS
  // ============================================

  const startAuction = useCallback(async () => {
    console.log("🚀 Starting auction...", {
      isAdmin: state.isAdmin,
      currentPhase: state.auctionState.phase,
    });

    if (!state.isAdmin) {
      console.error("❌ Not admin! Cannot start auction.");
      return;
    }

    try {
      const newState: AuctionState = {
        ...state.auctionState,
        phase: "IDLE",
        updatedAt: new Date().toISOString(),
      };
      console.log("📤 Updating auction state to:", newState);
      await firebaseService.setAuctionState(newState);
      console.log("✅ Auction state updated!");

      await firebaseService.addAuditLog({
        type: "AUCTION_START",
        details: { note: "Auction started" },
      });
      console.log("✅ Audit log added!");
    } catch (error) {
      console.error("❌ Error starting auction:", error);
    }
  }, [state.isAdmin, state.auctionState]);

  const startBidding = useCallback(
    async (playerId: string) => {
      if (!state.isAdmin) return;

      const player = getPlayerById(playerId);
      if (!player) return;

      // Update player status
      await firebaseService.updatePlayer(playerId, { status: "BIDDING" });

      // Update auction state
      const newState: AuctionState = {
        phase: "BIDDING",
        currentPlayerId: playerId,
        basePrice: player.basePrice,
        currentBid: 0,
        leadingTeamId: null,
        bidHistory: [],
        updatedAt: new Date().toISOString(),
        lastSoldLogId: null,
      };
      await firebaseService.setAuctionState(newState);

      await firebaseService.addAuditLog({
        type: "PLAYER_BIDDING_START",
        details: {
          playerId,
          playerName: player.name,
          amount: player.basePrice,
        },
      });
    },
    [state.isAdmin, getPlayerById],
  );

  const placeBid = useCallback(
    async (teamId: TeamId) => {
      if (!state.isAdmin) return;
      if (state.auctionState.phase !== "BIDDING") return;

      const player = getPlayerById(state.auctionState.currentPlayerId!);
      if (!player) return;

      const nextBid = getNextBidAmount();
      const canBid = canTeamBidOnPlayer(teamId, player, nextBid);

      if (!canBid.allowed) {
        console.error("Cannot bid:", canBid.reason);
        return;
      }

      const team = getTeamById(teamId);
      const newBidHistory = [
        ...state.auctionState.bidHistory,
        { teamId, amount: nextBid, timestamp: new Date().toISOString() },
      ];

      const newState: AuctionState = {
        ...state.auctionState,
        currentBid: nextBid,
        leadingTeamId: teamId,
        bidHistory: newBidHistory,
        updatedAt: new Date().toISOString(),
      };
      await firebaseService.setAuctionState(newState);

      await firebaseService.addAuditLog({
        type: "BID_PLACED",
        details: {
          playerId: player.id,
          playerName: player.name,
          teamId,
          teamName: team?.name,
          amount: nextBid,
        },
      });
    },
    [
      state.isAdmin,
      state.auctionState,
      getPlayerById,
      getNextBidAmount,
      canTeamBidOnPlayer,
      getTeamById,
    ],
  );

  const sellPlayer = useCallback(async () => {
    if (!state.isAdmin) return;
    if (state.auctionState.phase !== "BIDDING") return;
    if (
      !state.auctionState.leadingTeamId ||
      !state.auctionState.currentPlayerId
    )
      return;

    const playerId = state.auctionState.currentPlayerId;
    const teamId = state.auctionState.leadingTeamId;
    const soldPrice =
      state.auctionState.currentBid || state.auctionState.basePrice;

    const player = getPlayerById(playerId);
    const team = getTeamById(teamId);

    // Update player
    await firebaseService.updatePlayer(playerId, {
      status: "SOLD",
      soldToTeamId: teamId,
      soldPrice: soldPrice,
      soldAt: new Date().toISOString(),
    });

    // Add to roster
    await firebaseService.addPlayerToRoster(teamId, playerId);

    // Update auction state
    const newState: AuctionState = {
      phase: "IDLE",
      currentPlayerId: null,
      basePrice: 0,
      currentBid: 0,
      leadingTeamId: null,
      bidHistory: [],
      updatedAt: new Date().toISOString(),
      lastSoldLogId: playerId,
    };
    await firebaseService.setAuctionState(newState);

    await firebaseService.addAuditLog({
      type: "PLAYER_SOLD",
      details: {
        playerId,
        playerName: player?.name,
        teamId,
        teamName: team?.name,
        amount: soldPrice,
      },
    });
  }, [state.isAdmin, state.auctionState, getPlayerById, getTeamById]);

  const markUnsold = useCallback(async () => {
    if (!state.isAdmin) return;
    if (state.auctionState.phase !== "BIDDING") return;
    if (!state.auctionState.currentPlayerId) return;

    const playerId = state.auctionState.currentPlayerId;
    const player = getPlayerById(playerId);

    // Update player
    await firebaseService.updatePlayer(playerId, { status: "UNSOLD" });

    // Update auction state
    const newState: AuctionState = {
      phase: "IDLE",
      currentPlayerId: null,
      basePrice: 0,
      currentBid: 0,
      leadingTeamId: null,
      bidHistory: [],
      updatedAt: new Date().toISOString(),
      lastSoldLogId: null,
    };
    await firebaseService.setAuctionState(newState);

    await firebaseService.addAuditLog({
      type: "PLAYER_UNSOLD",
      details: { playerId, playerName: player?.name },
    });
  }, [state.isAdmin, state.auctionState, getPlayerById]);

  const undoLastSale = useCallback(async () => {
    if (!state.isAdmin) return;
    if (!state.auctionState.lastSoldLogId) return;

    const playerId = state.auctionState.lastSoldLogId;
    const player = getPlayerById(playerId);
    if (!player || !player.soldToTeamId) return;

    const teamId = player.soldToTeamId;
    const team = getTeamById(teamId);

    // Remove from roster
    await firebaseService.removePlayerFromRoster(teamId, playerId);

    // Reset player
    await firebaseService.updatePlayer(playerId, {
      status: "AVAILABLE",
      soldToTeamId: null,
      soldPrice: null,
      soldAt: null,
    });

    // Update auction state
    await firebaseService.updateAuctionState({
      lastSoldLogId: null,
      updatedAt: new Date().toISOString(),
    });

    await firebaseService.addAuditLog({
      type: "SALE_UNDO",
      details: {
        playerId,
        playerName: player.name,
        teamId,
        teamName: team?.name,
        amount: player.soldPrice ?? undefined,
      },
    });
  }, [state.isAdmin, state.auctionState, getPlayerById, getTeamById]);

  const pauseAuction = useCallback(async () => {
    if (!state.isAdmin) return;
    if (state.auctionState.phase !== "BIDDING") return;

    await firebaseService.updateAuctionState({
      phase: "PAUSED",
      updatedAt: new Date().toISOString(),
    });

    await firebaseService.addAuditLog({
      type: "AUCTION_PAUSE",
      details: { note: "Auction paused" },
    });
  }, [state.isAdmin, state.auctionState]);

  const resumeAuction = useCallback(async () => {
    if (!state.isAdmin) return;
    if (state.auctionState.phase !== "PAUSED") return;

    await firebaseService.updateAuctionState({
      phase: "BIDDING",
      updatedAt: new Date().toISOString(),
    });

    await firebaseService.addAuditLog({
      type: "AUCTION_RESUME",
      details: { note: "Auction resumed" },
    });
  }, [state.isAdmin, state.auctionState]);

  const completeAuction = useCallback(async () => {
    if (!state.isAdmin) return;

    await firebaseService.updateAuctionState({
      phase: "COMPLETED",
      updatedAt: new Date().toISOString(),
    });

    await firebaseService.addAuditLog({
      type: "AUCTION_COMPLETE",
      details: { note: "Auction completed" },
    });
  }, [state.isAdmin]);

  const reAuctionPlayer = useCallback(
    async (playerId: string) => {
      if (!state.isAdmin) return;

      const player = getPlayerById(playerId);
      if (!player || player.status !== "UNSOLD") return;

      await firebaseService.updatePlayer(playerId, { status: "AVAILABLE" });

      await firebaseService.addAuditLog({
        type: "PLAYER_REAUCTION",
        details: { playerId, playerName: player.name },
      });
    },
    [state.isAdmin, getPlayerById],
  );

  // Stop/Reset Auction (go back to NOT_STARTED)
  const stopAuction = useCallback(async () => {
    if (!state.isAdmin) return;

    // Reset auction state to NOT_STARTED
    const newState: AuctionState = {
      phase: "NOT_STARTED",
      currentPlayerId: null,
      basePrice: 0,
      currentBid: 0,
      leadingTeamId: null,
      bidHistory: [],
      updatedAt: new Date().toISOString(),
      lastSoldLogId: null,
    };
    await firebaseService.setAuctionState(newState);

    // Reset any player currently in bidding
    if (state.auctionState.currentPlayerId) {
      await firebaseService.updatePlayer(state.auctionState.currentPlayerId, {
        status: "AVAILABLE",
      });
    }

    await firebaseService.addAuditLog({
      type: "AUCTION_PAUSE",
      details: { note: "Auction stopped and reset to NOT_STARTED" },
    });
  }, [state.isAdmin, state.auctionState]);

  // Cancel current bidding (without marking unsold)
  const cancelBidding = useCallback(async () => {
    if (!state.isAdmin) return;
    if (
      state.auctionState.phase !== "BIDDING" &&
      state.auctionState.phase !== "PAUSED"
    )
      return;
    if (!state.auctionState.currentPlayerId) return;

    const playerId = state.auctionState.currentPlayerId;
    const player = getPlayerById(playerId);

    // Reset player to available
    await firebaseService.updatePlayer(playerId, { status: "AVAILABLE" });

    // Reset auction state to IDLE
    const newState: AuctionState = {
      phase: "IDLE",
      currentPlayerId: null,
      basePrice: 0,
      currentBid: 0,
      leadingTeamId: null,
      bidHistory: [],
      updatedAt: new Date().toISOString(),
      lastSoldLogId: null,
    };
    await firebaseService.setAuctionState(newState);

    await firebaseService.addAuditLog({
      type: "AUCTION_PAUSE",
      details: {
        playerId,
        playerName: player?.name,
        note: "Bidding cancelled",
      },
    });
  }, [state.isAdmin, state.auctionState, getPlayerById]);

  // Get sold players
  const getSoldPlayers = useCallback((): Player[] => {
    return state.players.filter((p) => p.status === "SOLD");
  }, [state.players]);

  // Get unsold players
  const getUnsoldPlayers = useCallback((): Player[] => {
    return state.players.filter((p) => p.status === "UNSOLD");
  }, [state.players]);

  // ============================================
  // TEAM ACTIONS
  // ============================================

  const updateTeamOwner = useCallback(
    async (teamId: TeamId, ownerName: string) => {
      if (!state.isAdmin) return;

      const team = getTeamById(teamId);
      await firebaseService.updateTeam(teamId, { ownerName });

      await firebaseService.addAuditLog({
        type: "TEAM_OWNER_UPDATED",
        details: { teamId, teamName: team?.name, newValue: ownerName },
      });
    },
    [state.isAdmin, getTeamById],
  );

  const removePlayerFromTeam = useCallback(
    async (teamId: TeamId, playerId: string) => {
      if (!state.isAdmin) return;

      const player = getPlayerById(playerId);
      const team = getTeamById(teamId);

      // Remove from roster
      await firebaseService.removePlayerFromRoster(teamId, playerId);

      // Reset player
      await firebaseService.updatePlayer(playerId, {
        status: "AVAILABLE",
        soldToTeamId: null,
        soldPrice: null,
        soldAt: null,
      });

      await firebaseService.addAuditLog({
        type: "SALE_UNDO",
        details: {
          playerId,
          playerName: player?.name,
          teamId,
          teamName: team?.name,
          note: "Player removed from team by admin",
        },
      });
    },
    [state.isAdmin, getPlayerById, getTeamById],
  );

  // ============================================
  // MATCH ACTIONS
  // ============================================

  const updateMatchScore = useCallback(
    async (matchId: string, homeGoals: number, awayGoals: number) => {
      if (!state.isAdmin) return;

      const match = state.matches.find((m) => m.id === matchId);

      await firebaseService.updateMatch(matchId, {
        homeGoals,
        awayGoals,
        status: "COMPLETED",
        updatedAt: new Date().toISOString(),
      });

      await firebaseService.addAuditLog({
        type:
          match?.status === "COMPLETED"
            ? "MATCH_SCORE_UPDATED"
            : "MATCH_SCORE_ENTERED",
        details: {
          matchId,
          previousValue:
            match && match.homeGoals !== null
              ? `${match.homeGoals}-${match.awayGoals}`
              : undefined,
          newValue: `${homeGoals}-${awayGoals}`,
        },
      });
    },
    [state.isAdmin, state.matches],
  );

  const updateFinalScore = useCallback(
    async (scoreA: number, scoreB: number) => {
      if (!state.isAdmin) return;

      // Get top 2 teams from standings
      // For now, we'll use a simple approach - this should be calculated from standings
      const winnerId: TeamId | null =
        scoreA > scoreB ? "rabies" : scoreA < scoreB ? "meow" : null;
      const finalMatch: FinalMatch = {
        id: "FINAL",
        teamAId: "rabies", // Would be calculated from standings
        teamBId: "meow", // Would be calculated from standings
        status: "COMPLETED",
        scoreA,
        scoreB,
        winnerId: winnerId,
        scheduledAt: new Date().toISOString(),
        venue: "ACC Futsal Arena",
      };

      await firebaseService.setFinalMatch(finalMatch);

      await firebaseService.addAuditLog({
        type: "FINAL_SCORE_ENTERED",
        details: { newValue: `${scoreA}-${scoreB}` },
      });
    },
    [state.isAdmin],
  );

  // Reset a match score
  const resetMatchScore = useCallback(
    async (matchId: string) => {
      if (!state.isAdmin) return;

      const match = state.matches.find((m) => m.id === matchId);

      await firebaseService.updateMatch(matchId, {
        homeGoals: null,
        awayGoals: null,
        status: "SCHEDULED",
        updatedAt: new Date().toISOString(),
      });

      await firebaseService.addAuditLog({
        type: "MATCH_SCORE_UPDATED",
        details: {
          matchId,
          previousValue: match
            ? `${match.homeGoals}-${match.awayGoals}`
            : undefined,
          newValue: "Reset to scheduled",
          note: "Match score reset",
        },
      });
    },
    [state.isAdmin, state.matches],
  );

  // Reset final match
  const resetFinalMatch = useCallback(async () => {
    if (!state.isAdmin) return;

    // Set final match to null or pending state
    const emptyFinal: FinalMatch = {
      id: "FINAL",
      teamAId: "rabies",
      teamBId: "meow",
      status: "PENDING",
      scoreA: null,
      scoreB: null,
      winnerId: null,
      scheduledAt: null,
      venue: null,
    };
    await firebaseService.setFinalMatch(emptyFinal);

    await firebaseService.addAuditLog({
      type: "MATCH_SCORE_UPDATED",
      details: { note: "Final match reset" },
    });
  }, [state.isAdmin]);

  // Reset auction data only (keep players but reset auction state and rosters)
  const resetAuctionData = useCallback(async () => {
    if (!state.isAdmin) return;

    // Reset all players to available (except team owners who are free)
    for (const player of state.players) {
      // Check if this is a team owner (free player)
      const isTeamOwner = [
        "member-007",
        "member-010",
        "member-002",
        "member-013",
        "alumni-001",
      ].includes(player.id);

      if (isTeamOwner) {
        // Keep team owners as they are
        continue;
      }

      await firebaseService.updatePlayer(player.id, {
        status: "AVAILABLE",
        soldToTeamId: null,
        soldPrice: null,
        soldAt: null,
      });
    }

    // Reset rosters to only team owners
    await firebaseService.setRosters(INITIAL_ROSTERS);

    // Reset auction state
    await firebaseService.setAuctionState(INITIAL_AUCTION_STATE);

    await firebaseService.addAuditLog({
      type: "DATA_RESET",
      details: {
        note: "Auction data reset - rosters cleared except team owners",
      },
    });
  }, [state.isAdmin, state.players]);

  // Reset league data only
  const resetLeagueData = useCallback(async () => {
    if (!state.isAdmin) return;

    // Reset all matches
    await firebaseService.setMatches(INITIAL_MATCHES);

    // Reset final match
    await resetFinalMatch();

    await firebaseService.addAuditLog({
      type: "DATA_RESET",
      details: { note: "League data reset - all matches cleared" },
    });
  }, [state.isAdmin, resetFinalMatch]);

  // ============================================
  // DATA ACTIONS
  // ============================================

  const resetAllData = useCallback(async () => {
    if (!state.isAdmin) return;

    await firebaseService.resetAllData();

    // Re-initialize with fresh data
    await firebaseService.initializeAllData({
      players: INITIAL_PLAYERS,
      teams: INITIAL_TEAMS,
      rosters: INITIAL_ROSTERS,
      auctionState: INITIAL_AUCTION_STATE,
      matches: INITIAL_MATCHES,
      finalMatch: null,
    });

    dispatch({ type: "RESET_STATE" });
  }, [state.isAdmin]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const contextValue: AppContextValue = {
    ...state,
    login,
    logout,
    startAuction,
    stopAuction,
    startBidding,
    cancelBidding,
    placeBid,
    sellPlayer,
    markUnsold,
    undoLastSale,
    pauseAuction,
    resumeAuction,
    completeAuction,
    reAuctionPlayer,
    updateTeamOwner,
    removePlayerFromTeam,
    updateMatchScore,
    resetMatchScore,
    updateFinalScore,
    resetFinalMatch,
    initializeFirebase,
    resetAllData,
    resetAuctionData,
    resetLeagueData,
    getTeamById,
    getPlayerById,
    getTeamRoster,
    getTeamBudget,
    getTeamConstraints,
    canTeamBidOnPlayer,
    getNextBidAmount,
    getBidIncrement,
    getAvailablePlayers,
    getPlayersByPosition,
    getPlayersByCategory,
    getSoldPlayers,
    getUnsoldPlayers,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
