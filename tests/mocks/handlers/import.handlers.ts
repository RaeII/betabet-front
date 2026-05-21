import { http, HttpResponse } from 'msw'
import type { ImportResult, ImportStatus, MatchPreview, TeamPreview } from '@/types/import.types'

export const mockTeams: TeamPreview[] = [
  { apiTeamId: 6, name: 'Brazil', flagUrl: 'https://media.api-sports.io/flags/br.svg', country: 'Brazil', groupLetter: 'D', exists: false },
  { apiTeamId: 24, name: 'Croatia', flagUrl: 'https://media.api-sports.io/flags/hr.svg', country: 'Croatia', groupLetter: 'D', exists: true },
]

export const mockMatches: MatchPreview[] = [
  {
    apiFixtureId: 1035049,
    homeTeam: mockTeams[0],
    awayTeam: mockTeams[1],
    scheduledAt: '2026-06-14T15:00:00Z',
    status: 'upcoming',
    phase: 'group',
    groupName: 'Group D',
    matchday: 1,
    homeScore: null,
    awayScore: null,
    exists: false,
    teamsImported: false,
  },
  {
    apiFixtureId: 1035050,
    homeTeam: { ...mockTeams[0], exists: true },
    awayTeam: { ...mockTeams[1], exists: true },
    scheduledAt: '2026-06-15T18:00:00Z',
    status: 'upcoming',
    phase: 'group',
    groupName: 'Group D',
    matchday: 1,
    homeScore: null,
    awayScore: null,
    exists: false,
    teamsImported: true,
  },
]

export const mockImportStatus: ImportStatus = {
  teamsInApi: 48,
  teamsInDb: 12,
  matchesInApi: 104,
  matchesInDb: 5,
}

const mockImportResult: ImportResult = { created: 1, skipped: 0, total: 1, errors: [] }
const mockBulkTeamResult: ImportResult = { created: 1, skipped: 1, total: 2, errors: [] }
const mockBulkMatchResult: ImportResult = { created: 1, skipped: 0, total: 1, errors: [] }

export const importHandlers = [
  http.get('/api/admin/import/status', () =>
    HttpResponse.json(mockImportStatus),
  ),

  http.get('/api/admin/import/teams/preview', () =>
    HttpResponse.json({ teams: mockTeams }),
  ),

  http.post('/api/admin/import/teams', () =>
    HttpResponse.json(mockBulkTeamResult),
  ),

  http.post('/api/admin/import/teams/:apiTeamId', () =>
    HttpResponse.json(mockImportResult, { status: 201 }),
  ),

  http.get('/api/admin/import/matches/preview', () =>
    HttpResponse.json({ matches: mockMatches }),
  ),

  http.post('/api/admin/import/matches', () =>
    HttpResponse.json(mockBulkMatchResult),
  ),

  http.post('/api/admin/import/matches/:apiFixtureId', () =>
    HttpResponse.json(mockImportResult, { status: 201 }),
  ),
]
