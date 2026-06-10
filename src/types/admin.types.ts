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
  totalMatches: number
}

export type SortDir = 'asc' | 'desc'

export type UserSortField = 'createdAt' | 'name' | 'totalBets' | 'groupsCreated' | 'referralCount'
export type GroupSortField = 'createdAt' | 'name' | 'memberCount'

export interface ListParams<TSort extends string> {
  page?: number
  limit?: number
  search?: string
  createdFrom?: string
  createdTo?: string
  sortBy?: TSort
  sortDir?: SortDir
}

export type UserStatsParams = ListParams<UserSortField>
export type GroupStatsParams = ListParams<GroupSortField>

export interface Paginated<T> {
  total: number
  page: number
  limit: number
  items: T[]
}

export interface GroupStats {
  groupId: string
  name: string
  memberCount: number
  adminName: string
  joinMode: 'invite' | 'request'
  createdAt: string
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
