import type { Match, TournamentPhase } from './match.types'

export interface AdminUser {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface AdminStats {
  totalUsers: number
  totalGroups: number
  totalBets: number
}

export interface MatchAnalytics {
  matchId: string
  match: Match
  homePct: number
  drawPct: number
  awayPct: number
  totalBets: number
  byGroup: GroupBetDistribution[]
}

export interface GroupBetDistribution {
  groupId: string
  groupName: string
  homePct: number
  drawPct: number
  awayPct: number
  totalBets: number
}

export interface UserStats {
  userId: string
  name: string
  email: string
  groupsCreated: number
  referralCount: number
  totalBets: number
}

export interface MatchFormData {
  homeTeamId: string
  awayTeamId: string
  stadiumId: string
  scheduledAt: string
  phase: TournamentPhase
  groupName?: string
  matchday?: number
}

export interface TeamFormData {
  name: string
  flagUrl: string
  group?: string
}

export interface ResultFormData {
  homeScore: number
  awayScore: number
}

export interface ChampionState {
  championTeamId: string | null
  settledAt: string | null
}

export interface SetChampionResult {
  championTeamId: string
  betsSettled: number
}

export interface RemoveChampionResult {
  betsReset: number
}
