import { apiDelete, apiGet, apiPost, apiPut } from './api'
import type { AdminUser, AdminStats, ChampionState, MatchAnalytics, MatchFormData, RemoveChampionResult, ResultFormData, SetChampionResult, TeamFormData, UserStats } from '@/types/admin.types'
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
  return apiGet('/api/admin/stats')
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

export function getUserStats(page = 1, limit = 20): Promise<{ users: UserStats[]; total: number }> {
  return apiGet(`/api/admin/analytics/users?page=${page}&limit=${limit}`)
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
