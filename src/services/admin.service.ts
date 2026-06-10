import { apiDelete, apiGet, apiPost, apiPut } from './api'
import type { AdminUser, AdminStats, ChampionState, GroupStats, GroupStatsParams, MatchAnalytics, MatchFormData, RemoveChampionResult, ResultFormData, SetChampionResult, TeamFormData, UserStats, UserStatsParams } from '@/types/admin.types'
import type { Match } from '@/types/match.types'
import type { BettingGroup, GroupMembership, RankingEntry } from '@/types/group.types'
import type { Team } from '@/types/match.types'

export function adminLogin(email: string, password: string): Promise<{ admin: AdminUser }> {
  return apiPost('/api/admin/auth/login', { email, password })
}

export function adminLogout(): Promise<{ ok: boolean }> {
  return apiPost('/api/admin/auth/logout', {})
}

export function getAdminStats(): Promise<AdminStats> {
  return apiGet<{ stats: AdminStats }>('/api/admin/stats').then(res => res.stats)
}

export function getAdminMatches(): Promise<{ matches: Match[] }> {
  return apiGet('/api/admin/matches')
}

export function createMatch(data: MatchFormData): Promise<{ match: Match }> {
  return apiPost('/api/admin/matches', data)
}

export function updateMatch(matchId: string, data: Partial<MatchFormData>): Promise<{ match: Match }> {
  return apiPut(`/api/admin/matches/${matchId}`, data)
}

export function confirmResult(
  matchId: string,
  data: ResultFormData,
): Promise<{ match: Match; betsProcessed: number }> {
  return apiPost(`/api/admin/matches/${matchId}/result`, data)
}

export function deleteMatch(matchId: string): Promise<void> {
  return apiDelete(`/api/admin/matches/${matchId}`)
}

export interface AdminGroup {
  id: string
  name: string
  memberCount: number
}

export function listAdminGroups(): Promise<{ groups: AdminGroup[] }> {
  return apiGet('/api/admin/groups')
}

export interface TestMatch {
  id: string
  homeTeamName: string
  awayTeamName: string
  scheduledAt: string
  status: string
  homeScore: number | null
  awayScore: number | null
  betCount: number
  targetGroups: { id: string; name: string }[]
}

export function getTestMatches(): Promise<{ matches: TestMatch[] }> {
  return apiGet('/api/admin/friendly-matches')
}

export function getTeams(): Promise<{ teams: Team[] }> {
  return apiGet('/api/admin/teams')
}

export function createTeam(data: TeamFormData): Promise<{ team: Team }> {
  return apiPost('/api/admin/teams', data)
}

export function deleteTeam(teamId: string): Promise<void> {
  return apiDelete(`/api/admin/teams/${teamId}`)
}

export function getMatchAnalytics(): Promise<{ analytics: MatchAnalytics[] }> {
  return apiGet('/api/admin/analytics/matches')
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export interface UsersAnalyticsResponse {
  users: UserStats[]
  total: number
  page: number
  limit: number
}

export function getUserStats(params: UserStatsParams = {}): Promise<UsersAnalyticsResponse> {
  return apiGet(`/api/admin/analytics/users${buildQuery({ ...params })}`)
}

export interface GroupsAnalyticsResponse {
  groups: GroupStats[]
  total: number
  page: number
  limit: number
}

export function getGroupStats(params: GroupStatsParams = {}): Promise<GroupsAnalyticsResponse> {
  return apiGet(`/api/admin/analytics/groups${buildQuery({ ...params })}`)
}

export function getGroupObserver(groupId: string): Promise<{
  group: BettingGroup
  members: GroupMembership[]
  ranking: RankingEntry[]
}> {
  return apiGet(`/api/admin/groups/${groupId}/observer`)
}

export function getChampion(): Promise<ChampionState> {
  return apiGet('/api/admin/tournament/champion')
}

export function setChampion(championTeamId: number): Promise<SetChampionResult> {
  return apiPost('/api/admin/tournament/champion', { championTeamId })
}

export function removeChampion(): Promise<RemoveChampionResult> {
  return apiDelete('/api/admin/tournament/champion')
}
