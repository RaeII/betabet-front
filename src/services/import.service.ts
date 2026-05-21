import { apiGet, apiPost } from './api'
import type { ImportResult, ImportStatus, MatchPreview, TeamPreview } from '@/types/import.types'

export function getImportStatus(): Promise<ImportStatus> {
  return apiGet('/api/admin/import/status')
}

export function getTeamsPreview(): Promise<{ teams: TeamPreview[] }> {
  return apiGet('/api/admin/import/teams/preview')
}

export function importAllTeams(): Promise<ImportResult> {
  return apiPost('/api/admin/import/teams')
}

export function importTeam(apiTeamId: number): Promise<ImportResult> {
  return apiPost(`/api/admin/import/teams/${apiTeamId}`)
}

export function getMatchesPreview(): Promise<{ matches: MatchPreview[] }> {
  return apiGet('/api/admin/import/matches/preview')
}

export function importAllMatches(): Promise<ImportResult> {
  return apiPost('/api/admin/import/matches')
}

export function importMatch(apiFixtureId: number): Promise<ImportResult> {
  return apiPost(`/api/admin/import/matches/${apiFixtureId}`)
}
