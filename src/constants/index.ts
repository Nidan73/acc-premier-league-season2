import type { Team, TeamId, PlayerPosition, PlayerCategory, LeagueMatch } from '@/types';

/**
 * Currency configuration for Bangladeshi Taka
 */
export const CURRENCY = {
  symbol: '৳',
  code: 'BDT',
  name: 'Taka',
} as const;

/**
 * Format amount in Bangladeshi Taka
 */
export function formatTaka(amount: number): string {
  return `${CURRENCY.symbol}${amount.toLocaleString('en-IN')}`;
}

/**
 * Squad constraint rules
 */
export const SQUAD_RULES = {
  MAX_SQUAD_SIZE: 8,
  MIN_SQUAD_SIZE: 6,
  MAX_ALUMNI: 1,
  MIN_ALUMNI: 1,
  MAX_GOALKEEPERS: 1,
  TEAM_BUDGET: 150000,
} as const;

/**
 * Points configuration for league
 */
export const POINTS_CONFIG = {
  WIN: 3,
  DRAW: 1,
  LOSS: 0,
} as const;

/**
 * Fixed team configuration - immutable
 */
export const TEAMS: readonly Team[] = [
  {
    id: 'rabies',
    name: 'Team Rabies',
    shortName: 'RAB',
    ownerName: '',
    colorPrimary: '#DC2626',
    colorSecondary: '#FEE2E2',
    logoEmoji: '🦊',
    budget: SQUAD_RULES.TEAM_BUDGET,
  },
  {
    id: 'meow',
    name: 'Meow - meoW FC',
    shortName: 'MEW',
    ownerName: '',
    colorPrimary: '#7C3AED',
    colorSecondary: '#EDE9FE',
    logoEmoji: '🐱',
    budget: SQUAD_RULES.TEAM_BUDGET,
  },
  {
    id: 'nazi',
    name: 'Team Nazi',
    shortName: 'NAZ',
    ownerName: '',
    colorPrimary: '#059669',
    colorSecondary: '#D1FAE5',
    logoEmoji: '⚡',
    budget: SQUAD_RULES.TEAM_BUDGET,
  },
  {
    id: 'goaldiggers',
    name: 'Goal Diggers',
    shortName: 'GDG',
    ownerName: '',
    colorPrimary: '#D97706',
    colorSecondary: '#FEF3C7',
    logoEmoji: '⛏️',
    budget: SQUAD_RULES.TEAM_BUDGET,
  },
  {
    id: 'crazy',
    name: 'Team Crazy',
    shortName: 'CRZ',
    ownerName: '',
    colorPrimary: '#2563EB',
    colorSecondary: '#DBEAFE',
    logoEmoji: '🤪',
    budget: SQUAD_RULES.TEAM_BUDGET,
  },
] as const;

/**
 * Get team by ID
 */
export function getTeam(teamId: TeamId): Team {
  return TEAMS.find(t => t.id === teamId) ?? TEAMS[0];
}

/**
 * Position display configuration
 */
export const POSITION_CONFIG: Record<PlayerPosition, { label: string; color: string; bgColor: string }> = {
  GK: { label: 'Goalkeeper', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  DEF: { label: 'Defender', color: 'text-green-700', bgColor: 'bg-green-100' },
  MID: { label: 'Midfielder', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  FWD: { label: 'Forward', color: 'text-red-700', bgColor: 'bg-red-100' },
};

/**
 * Category display configuration
 */
export const CATEGORY_CONFIG: Record<PlayerCategory, { label: string; color: string; bgColor: string }> = {
  MEMBER: { label: 'Member', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  ALUMNI: { label: 'Alumni', color: 'text-purple-700', bgColor: 'bg-purple-100' },
};

/**
 * Calculate bid increment based on current bid
 * Below ৳10,000: increment by ৳1,000
 * ৳10,000 and above: increment by ৳2,000
 */
export function getBidIncrement(currentBid: number): number {
  if (currentBid < 10000) {
    return 1000;
  }
  return 2000;
}

/**
 * Calculate next valid bid amount
 */
export function getNextBid(currentBid: number): number {
  return currentBid + getBidIncrement(currentBid);
}

/**
 * Fixed 5-team round-robin fixture (10 matches total)
 */
export const LEAGUE_FIXTURE: ReadonlyArray<{ round: 1 | 2 | 3 | 4 | 5; home: TeamId; away: TeamId }> = [
  // Round 1 (Bye: crazy)
  { round: 1, home: 'rabies', away: 'meow' },
  { round: 1, home: 'nazi', away: 'goaldiggers' },
  // Round 2 (Bye: goaldiggers)
  { round: 2, home: 'crazy', away: 'rabies' },
  { round: 2, home: 'meow', away: 'nazi' },
  // Round 3 (Bye: meow)
  { round: 3, home: 'goaldiggers', away: 'crazy' },
  { round: 3, home: 'rabies', away: 'nazi' },
  // Round 4 (Bye: rabies)
  { round: 4, home: 'meow', away: 'goaldiggers' },
  { round: 4, home: 'nazi', away: 'crazy' },
  // Round 5 (Bye: nazi)
  { round: 5, home: 'crazy', away: 'meow' },
  { round: 5, home: 'goaldiggers', away: 'rabies' },
];

/**
 * Get bye team for a round
 */
export function getByeTeam(round: number): TeamId {
  const byeTeams: Record<number, TeamId> = {
    1: 'crazy',
    2: 'goaldiggers',
    3: 'meow',
    4: 'rabies',
    5: 'nazi',
  };
  return byeTeams[round] || 'crazy';
}

/**
 * Generate initial league matches
 */
export function generateInitialMatches(): LeagueMatch[] {
  return LEAGUE_FIXTURE.map((fixture, index) => ({
    id: `R${fixture.round}-M${(index % 2) + 1}`,
    roundNumber: fixture.round,
    homeTeamId: fixture.home,
    awayTeamId: fixture.away,
    status: 'SCHEDULED' as const,
    homeGoals: null,
    awayGoals: null,
    scheduledAt: null,
    venue: null,
    updatedAt: new Date().toISOString(),
  }));
}

/**
 * Storage keys for localStorage
 */
export const STORAGE_KEYS = {
  PLAYERS: 'acc_futsal_players',
  ROSTERS: 'acc_futsal_rosters',
  AUCTION_STATE: 'acc_futsal_auction',
  MATCHES: 'acc_futsal_matches',
  FINAL: 'acc_futsal_final',
  TEAM_SETTINGS: 'acc_futsal_teams',
  LOGS: 'acc_futsal_logs',
  ADMIN_SESSION: 'acc_futsal_admin_session',
} as const;

/**
 * Convert Google Drive share link to direct image URL
 * Supports multiple Google Drive URL formats
 */
export function convertGoogleDriveUrl(url: string): string {
  if (!url) return '';
  
  // Handle Google Drive URLs
  if (url.includes('drive.google.com')) {
    let fileId = '';
    
    // Format: https://drive.google.com/open?id=FILE_ID
    if (url.includes('/open?id=')) {
      fileId = url.split('/open?id=')[1]?.split('&')[0] || '';
    }
    // Format: https://drive.google.com/file/d/FILE_ID/view
    else if (url.includes('/file/d/')) {
      fileId = url.split('/file/d/')[1]?.split('/')[0] || '';
    }
    // Format: https://drive.google.com/uc?id=FILE_ID
    else if (url.includes('id=')) {
      fileId = url.split('id=')[1]?.split('&')[0] || '';
    }
    
    if (fileId) {
      // Use lh3.googleusercontent.com for better image loading
      return `https://lh3.googleusercontent.com/d/${fileId}=w400`;
    }
  }
  
  return url;
}

/**
 * Get player image URL with fallback
 */
export function getPlayerImageUrl(photoUrl: string, playerName: string): string {
  const convertedUrl = convertGoogleDriveUrl(photoUrl);
  if (convertedUrl) return convertedUrl;
  // Fallback to avatar
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(playerName)}`;
}
