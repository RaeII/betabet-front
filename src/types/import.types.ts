import type { MatchStatus, TournamentPhase } from './match.types'

export interface TeamPreview {
  apiTeamId: number
  name: string
  flagUrl: string
  country: string
  groupLetter: string | null
  exists: boolean
}

export interface MatchPreview {
  apiFixtureId: number
  homeTeam: TeamPreview
  awayTeam: TeamPreview
  scheduledAt: string
  status: MatchStatus
  phase: TournamentPhase
  groupName: string | null
  matchday: number | null
  homeScore: number | null
  awayScore: number | null
  exists: boolean
  teamsImported: boolean
}

export interface ImportResult {
  created: number
  skipped: number
  total: number
  errors: string[]
}

export interface ImportStatus {
  teamsInApi: number
  teamsInDb: number
  matchesInApi: number
  matchesInDb: number
}
