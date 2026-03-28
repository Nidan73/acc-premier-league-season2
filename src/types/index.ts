/**
 * Type Definitions for ACC Futsal League
 */

// ============================================
// TEAM TYPES
// ============================================

export type TeamId = 'rabies' | 'meow' | 'nazi' | 'goaldiggers' | 'crazy';

export interface Team {
  id: TeamId;
  name: string;
  shortName: string;
  ownerName: string;
  colorPrimary: string;
  colorSecondary: string;
  logoEmoji: string;
  budget: number;
}

// ============================================
// PLAYER TYPES
// ============================================

export type PlayerCategory = 'MEMBER' | 'ALUMNI';
export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';
export type PlayerStatus = 'AVAILABLE' | 'BIDDING' | 'SOLD' | 'UNSOLD';
export type StrongFoot = 'Left' | 'Right' | 'Both';

export interface PlayerPrivate {
  contactNo?: string;
  email?: string;
  transactionRef?: string;
  notes?: string;
}

export interface Player {
  id: string;
  name: string;
  category: PlayerCategory;
  position: PlayerPosition;
  strongFoot: StrongFoot;
  pitchMessage: string;
  photoUrl: string;
  basePrice: number;
  status: PlayerStatus;
  soldToTeamId: TeamId | null;
  soldPrice: number | null;
  soldAt: string | null;
  private: PlayerPrivate;
}

// ============================================
// ROSTER TYPES
// ============================================

export interface TeamRoster {
  teamId: TeamId;
  playerIds: string[];
}

export interface ComputedRosterStats {
  squadCount: number;
  alumniCount: number;
  gkCount: number;
  defenderCount: number;
  midCount: number;
  fwdCount: number;
  totalSpent: number;
  remainingBudget: number;
  canAddAlumni: boolean;
  canAddGK: boolean;
  canAddMore: boolean;
  hasReachedAlumniLimit: boolean;
  hasReachedGKLimit: boolean;
}

// ============================================
// AUCTION TYPES
// ============================================

export type AuctionPhase = 'NOT_STARTED' | 'IDLE' | 'BIDDING' | 'PAUSED' | 'COMPLETED';

export interface BidHistoryEntry {
  teamId: TeamId;
  amount: number;
  timestamp: string;
}

export interface AuctionState {
  phase: AuctionPhase;
  currentPlayerId: string | null;
  basePrice: number;
  currentBid: number;
  leadingTeamId: TeamId | null;
  bidHistory: BidHistoryEntry[];
  updatedAt: string;
  lastSoldLogId: string | null;
}

// ============================================
// LEAGUE TYPES
// ============================================

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'COMPLETED';

export interface LeagueMatch {
  id: string;
  roundNumber: 1 | 2 | 3 | 4 | 5;
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  status: MatchStatus;
  homeGoals: number | null;
  awayGoals: number | null;
  scheduledAt: string | null;
  venue: string | null;
  updatedAt: string;
}

export interface TeamStanding {
  teamId: TeamId;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: Array<'W' | 'D' | 'L'>;
}

// ============================================
// FINAL MATCH TYPES
// ============================================

export type FinalStatus = 'PENDING' | 'SCHEDULED' | 'LIVE' | 'COMPLETED';

export interface FinalMatch {
  id: 'FINAL';
  teamAId: TeamId;
  teamBId: TeamId;
  status: FinalStatus;
  scoreA: number | null;
  scoreB: number | null;
  winnerId: TeamId | null;
  scheduledAt: string | null;
  venue: string | null;
}

// ============================================
// AUDIT LOG TYPES
// ============================================

export type LogType =
  | 'AUCTION_START' | 'AUCTION_PAUSE' | 'AUCTION_RESUME' | 'AUCTION_COMPLETE'
  | 'PLAYER_BIDDING_START' | 'BID_PLACED' | 'PLAYER_SOLD' | 'PLAYER_UNSOLD'
  | 'PLAYER_REAUCTION' | 'SALE_UNDO'
  | 'MATCH_SCORE_ENTERED' | 'MATCH_SCORE_UPDATED'
  | 'FINAL_SCORE_ENTERED' | 'FINAL_WINNER_DECLARED'
  | 'TEAM_OWNER_UPDATED' | 'SETTINGS_CHANGED' | 'DATA_IMPORT' | 'DATA_RESET';

export interface AuditLogDetails {
  playerId?: string;
  playerName?: string;
  teamId?: TeamId;
  teamName?: string;
  matchId?: string;
  previousValue?: string | number | null;
  newValue?: string | number | null;
  amount?: number;
  note?: string;
}

export interface AuditLog {
  id: string;
  type: LogType;
  timestamp: string;
  details: AuditLogDetails;
}

// ============================================
// CONSTANTS
// ============================================

export const CURRENCY = {
  symbol: '৳',
  code: 'BDT',
  name: 'Taka',
} as const;

export const SQUAD_RULES = {
  MAX_SQUAD_SIZE: 8,
  MIN_SQUAD_SIZE: 6,
  MAX_ALUMNI: 1,
  MAX_GOALKEEPERS: 1,
  TEAM_BUDGET: 150000,
} as const;

export const POINTS_CONFIG = {
  WIN: 3,
  DRAW: 1,
  LOSS: 0,
} as const;

export const POSITION_CONFIG: Record<PlayerPosition, { label: string; color: string; bgColor: string }> = {
  GK: { label: 'Goalkeeper', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  DEF: { label: 'Defender', color: 'text-green-700', bgColor: 'bg-green-100' },
  MID: { label: 'Midfielder', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  FWD: { label: 'Forward', color: 'text-red-700', bgColor: 'bg-red-100' },
};

export const CATEGORY_CONFIG: Record<PlayerCategory, { label: string; color: string; bgColor: string }> = {
  MEMBER: { label: 'Member', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  ALUMNI: { label: 'Alumni', color: 'text-purple-700', bgColor: 'bg-purple-100' },
};

export const STATUS_CONFIG: Record<PlayerStatus, { label: string; color: string; bgColor: string }> = {
  AVAILABLE: { label: 'Available', color: 'text-green-700', bgColor: 'bg-green-100' },
  BIDDING: { label: 'Bidding', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  SOLD: { label: 'Sold', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  UNSOLD: { label: 'Unsold', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};
