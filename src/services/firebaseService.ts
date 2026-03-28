/**
 * Firebase Realtime Database Service
 * Handles all database operations for ACC Futsal League
 */

import { database, DB_PATHS, getRef, set, get, onValue, update, push } from '../lib/firebase';
import { ref } from 'firebase/database';
import type { Player, Team, TeamRoster, AuctionState, LeagueMatch, FinalMatch, AuditLog, TeamId } from '../types';

// ============================================
// PLAYERS
// ============================================

/**
 * Get all players from Firebase
 */
export async function getPlayers(): Promise<Player[]> {
  const snapshot = await get(getRef(DB_PATHS.PLAYERS));
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.values(data);
  }
  return [];
}

/**
 * Set all players (used for initial data load)
 */
export async function setPlayers(players: Player[]): Promise<void> {
  const playersObj: Record<string, Player> = {};
  players.forEach(player => {
    playersObj[player.id] = player;
  });
  await set(getRef(DB_PATHS.PLAYERS), playersObj);
}

/**
 * Update a single player
 */
export async function updatePlayer(playerId: string, updates: Partial<Player>): Promise<void> {
  await update(getRef(`${DB_PATHS.PLAYERS}/${playerId}`), updates);
}

/**
 * Subscribe to players changes (real-time)
 */
export function subscribeToPlayers(callback: (players: Player[]) => void): () => void {
  const unsubscribe = onValue(getRef(DB_PATHS.PLAYERS), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      callback(Object.values(data));
    } else {
      callback([]);
    }
  });
  return unsubscribe;
}

// ============================================
// TEAMS
// ============================================

/**
 * Get all teams from Firebase
 */
export async function getTeams(): Promise<Team[]> {
  const snapshot = await get(getRef(DB_PATHS.TEAMS));
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.values(data);
  }
  return [];
}

/**
 * Set all teams (used for initial data load)
 */
export async function setTeams(teams: Team[]): Promise<void> {
  const teamsObj: Record<string, Team> = {};
  teams.forEach(team => {
    teamsObj[team.id] = team;
  });
  await set(getRef(DB_PATHS.TEAMS), teamsObj);
}

/**
 * Update a single team
 */
export async function updateTeam(teamId: TeamId, updates: Partial<Team>): Promise<void> {
  await update(getRef(`${DB_PATHS.TEAMS}/${teamId}`), updates);
}

/**
 * Subscribe to teams changes (real-time)
 */
export function subscribeToTeams(callback: (teams: Team[]) => void): () => void {
  const unsubscribe = onValue(getRef(DB_PATHS.TEAMS), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      callback(Object.values(data));
    } else {
      callback([]);
    }
  });
  return unsubscribe;
}

// ============================================
// ROSTERS
// ============================================

/**
 * Get all rosters from Firebase
 */
export async function getRosters(): Promise<TeamRoster[]> {
  const snapshot = await get(getRef(DB_PATHS.ROSTERS));
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.values(data);
  }
  return [];
}

/**
 * Set all rosters (used for initial data load)
 */
export async function setRosters(rosters: TeamRoster[]): Promise<void> {
  const rostersObj: Record<string, TeamRoster> = {};
  rosters.forEach(roster => {
    rostersObj[roster.teamId] = roster;
  });
  await set(getRef(DB_PATHS.ROSTERS), rostersObj);
}

/**
 * Update a single roster
 */
export async function updateRoster(teamId: TeamId, playerIds: string[]): Promise<void> {
  await set(getRef(`${DB_PATHS.ROSTERS}/${teamId}`), { teamId, playerIds });
}

/**
 * Add player to team roster
 */
export async function addPlayerToRoster(teamId: TeamId, playerId: string): Promise<void> {
  const snapshot = await get(getRef(`${DB_PATHS.ROSTERS}/${teamId}`));
  let currentPlayerIds: string[] = [];
  if (snapshot.exists()) {
    currentPlayerIds = snapshot.val().playerIds || [];
  }
  if (!currentPlayerIds.includes(playerId)) {
    currentPlayerIds.push(playerId);
  }
  await set(getRef(`${DB_PATHS.ROSTERS}/${teamId}`), { teamId, playerIds: currentPlayerIds });
}

/**
 * Remove player from team roster
 */
export async function removePlayerFromRoster(teamId: TeamId, playerId: string): Promise<void> {
  const snapshot = await get(getRef(`${DB_PATHS.ROSTERS}/${teamId}`));
  if (snapshot.exists()) {
    const currentPlayerIds: string[] = snapshot.val().playerIds || [];
    const updatedPlayerIds = currentPlayerIds.filter(id => id !== playerId);
    await set(getRef(`${DB_PATHS.ROSTERS}/${teamId}`), { teamId, playerIds: updatedPlayerIds });
  }
}

/**
 * Subscribe to rosters changes (real-time)
 */
export function subscribeToRosters(callback: (rosters: TeamRoster[]) => void): () => void {
  const unsubscribe = onValue(getRef(DB_PATHS.ROSTERS), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      callback(Object.values(data));
    } else {
      callback([]);
    }
  });
  return unsubscribe;
}

// ============================================
// AUCTION STATE
// ============================================

/**
 * Get auction state from Firebase
 */
export async function getAuctionState(): Promise<AuctionState | null> {
  const snapshot = await get(getRef(DB_PATHS.AUCTION_STATE));
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
}

/**
 * Set auction state
 */
export async function setAuctionState(state: AuctionState): Promise<void> {
  await set(getRef(DB_PATHS.AUCTION_STATE), state);
}

/**
 * Update auction state
 */
export async function updateAuctionState(updates: Partial<AuctionState>): Promise<void> {
  await update(getRef(DB_PATHS.AUCTION_STATE), updates);
}

/**
 * Subscribe to auction state changes (real-time)
 */
export function subscribeToAuctionState(callback: (state: AuctionState | null) => void): () => void {
  const unsubscribe = onValue(getRef(DB_PATHS.AUCTION_STATE), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });
  return unsubscribe;
}

// ============================================
// LEAGUE MATCHES
// ============================================

/**
 * Get all matches from Firebase
 */
export async function getMatches(): Promise<LeagueMatch[]> {
  const snapshot = await get(getRef(DB_PATHS.MATCHES));
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.values(data);
  }
  return [];
}

/**
 * Set all matches (used for initial data load)
 */
export async function setMatches(matches: LeagueMatch[]): Promise<void> {
  const matchesObj: Record<string, LeagueMatch> = {};
  matches.forEach(match => {
    matchesObj[match.id] = match;
  });
  await set(getRef(DB_PATHS.MATCHES), matchesObj);
}

/**
 * Update a single match
 */
export async function updateMatch(matchId: string, updates: Partial<LeagueMatch>): Promise<void> {
  await update(getRef(`${DB_PATHS.MATCHES}/${matchId}`), updates);
}

/**
 * Subscribe to matches changes (real-time)
 */
export function subscribeToMatches(callback: (matches: LeagueMatch[]) => void): () => void {
  const unsubscribe = onValue(getRef(DB_PATHS.MATCHES), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      callback(Object.values(data));
    } else {
      callback([]);
    }
  });
  return unsubscribe;
}

// ============================================
// FINAL MATCH
// ============================================

/**
 * Get final match from Firebase
 */
export async function getFinalMatch(): Promise<FinalMatch | null> {
  const snapshot = await get(getRef(DB_PATHS.FINAL_MATCH));
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
}

/**
 * Set final match
 */
export async function setFinalMatch(match: FinalMatch): Promise<void> {
  await set(getRef(DB_PATHS.FINAL_MATCH), match);
}

/**
 * Update final match
 */
export async function updateFinalMatch(updates: Partial<FinalMatch>): Promise<void> {
  await update(getRef(DB_PATHS.FINAL_MATCH), updates);
}

/**
 * Subscribe to final match changes (real-time)
 */
export function subscribeToFinalMatch(callback: (match: FinalMatch | null) => void): () => void {
  const unsubscribe = onValue(getRef(DB_PATHS.FINAL_MATCH), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });
  return unsubscribe;
}

// ============================================
// AUDIT LOGS
// ============================================

/**
 * Add an audit log entry
 */
export async function addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
  const newLogRef = push(ref(database, DB_PATHS.AUDIT_LOGS));
  const logEntry: AuditLog = {
    ...log,
    id: newLogRef.key || `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  await set(newLogRef, logEntry);
}

/**
 * Get audit logs (most recent first)
 */
export async function getAuditLogs(limit?: number): Promise<AuditLog[]> {
  const snapshot = await get(getRef(DB_PATHS.AUDIT_LOGS));
  if (snapshot.exists()) {
    const data = snapshot.val();
    const logs: AuditLog[] = Object.values(data);
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return limit ? logs.slice(0, limit) : logs;
  }
  return [];
}

/**
 * Subscribe to audit logs changes (real-time)
 */
export function subscribeToAuditLogs(callback: (logs: AuditLog[]) => void): () => void {
  const unsubscribe = onValue(getRef(DB_PATHS.AUDIT_LOGS), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const logs: AuditLog[] = Object.values(data);
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(logs);
    } else {
      callback([]);
    }
  });
  return unsubscribe;
}

// ============================================
// DATA MANAGEMENT
// ============================================

/**
 * Check if Firebase has been initialized with data
 */
export async function isDataInitialized(): Promise<boolean> {
  const snapshot = await get(getRef(DB_PATHS.PLAYERS));
  return snapshot.exists();
}

/**
 * Initialize Firebase with all data
 */
export async function initializeAllData(data: {
  players: Player[];
  teams: Team[];
  rosters: TeamRoster[];
  auctionState: AuctionState;
  matches: LeagueMatch[];
  finalMatch: FinalMatch | null;
}): Promise<void> {
  await Promise.all([
    setPlayers(data.players),
    setTeams(data.teams),
    setRosters(data.rosters),
    setAuctionState(data.auctionState),
    setMatches(data.matches),
    data.finalMatch ? setFinalMatch(data.finalMatch) : Promise.resolve(),
  ]);
  
  await addAuditLog({
    type: 'DATA_IMPORT',
    details: {
      note: 'Initial data loaded to Firebase',
    },
  });
}

/**
 * Export all data from Firebase
 */
export async function exportAllData(): Promise<{
  players: Player[];
  teams: Team[];
  rosters: TeamRoster[];
  auctionState: AuctionState | null;
  matches: LeagueMatch[];
  finalMatch: FinalMatch | null;
  auditLogs: AuditLog[];
}> {
  const [players, teams, rosters, auctionState, matches, finalMatch, auditLogs] = await Promise.all([
    getPlayers(),
    getTeams(),
    getRosters(),
    getAuctionState(),
    getMatches(),
    getFinalMatch(),
    getAuditLogs(),
  ]);
  
  return { players, teams, rosters, auctionState, matches, finalMatch, auditLogs };
}

/**
 * Reset all data in Firebase
 */
export async function resetAllData(): Promise<void> {
  await set(ref(database, '/'), null);
}
