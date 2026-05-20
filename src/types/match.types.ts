import type { Bet } from './bet.types'

export type MatchStatus = 'upcoming' | 'live' | 'finished' | 'cancelled'

export type TournamentPhase = 'group' | 'r16' | 'qf' | 'sf' | 'final'

export interface Team {
  id: string
  name: string
  flagUrl: string
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
