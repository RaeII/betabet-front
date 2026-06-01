import type { Bet } from './bet.types'

export type MatchStatus = 'upcoming' | 'live' | 'finished' | 'cancelled'

export type TournamentPhase = 'group' | 'r16' | 'qf' | 'sf' | 'final'

export interface Team {
  id: string
  /** API-Football team id. Used to reconcile official standings with locally
   *  cached team flags from match payloads. */
  apiTeamId?: number | null
  name: string
  /** Data URI (`data:image/svg+xml;base64,...`) or external URL. Empty when the backend
   *  knows the client already has it cached under `flagVersion`. */
  flagUrl: string
  /** Stored-flag version (ms since epoch as string). `null` when the team has no
   *  base64 flag persisted (only the legacy external URL). */
  flagVersion: string | null
  group: string | null
}

export interface Stadium {
  id: string
  name: string
  city: string
}

export interface Match {
  id: string
  homeTeam: Team
  awayTeam: Team
  stadium: Stadium
  scheduledAt: string
  status: MatchStatus
  phase: TournamentPhase
  groupName: string | null
  matchday: number | null
  homeScore: number | null
  awayScore: number | null
}

export interface MatchWithUserBet extends Match {
  userBet: Bet | null
}

export interface DistributionData {
  matchId: string
  homePct: number
  drawPct: number
  awayPct: number
  totalBets: number
}

export interface MatchesResponse {
  groupStage: Record<string, Record<string, Match[]>>
  knockout: Record<string, Match[]>
}

export interface MatchdayGroup {
  date: string
  label: string
  matches: MatchWithUserBet[]
  isPast: boolean
  isToday: boolean
}

export interface BettingProgress {
  betted: number
  total: number
  pct: number
  isComplete: boolean
}

export interface GroupMatchesResponse {
  matches: MatchWithUserBet[]
}

/**
 * Detalhamento de pontos de um membro do grupo (modal de validação no ranking).
 * `matches` traz todas as partidas — inclusive as que o membro não palpitou
 * (`userBet === null`). `canView=false` quando o espectador ainda não
 * desbloqueou a visualização de palpites alheios (3 indicações).
 */
export interface RankingBreakdown {
  canView: boolean
  user: { id: string; name: string; avatarUrl: string | null }
  matches: MatchWithUserBet[]
}
