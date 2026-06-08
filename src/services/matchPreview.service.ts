import { apiGet } from './api'

export interface PreviewProbability {
  percent: { home: number; draw: number; away: number }
  winner: { id: number | null; name: string | null; comment: string | null } | null
  advice: string | null
  expectedGoals: { home: number | null; away: number | null }
  underOver: string | null
}

export interface PreviewVenue {
  name: string | null
  city: string | null
  capacity: number | null
  image: string | null
}

export interface PreviewLineupPlayer {
  id: number | null
  name: string
  number: number | null
  pos: string | null
  grid: string | null
}

export interface PreviewLineupColors {
  player: { primary: string; number: string; border: string }
  goalkeeper: { primary: string; number: string; border: string }
}

export interface PreviewLineup {
  team: { id: number; name: string; logo: string; colors: PreviewLineupColors | null }
  coach: { id: number | null; name: string | null; photo: string | null }
  formation: string | null
  startXI: PreviewLineupPlayer[]
  substitutes: PreviewLineupPlayer[]
}

export interface PreviewInjury {
  teamId: number
  teamName: string
  playerId: number
  playerName: string
  photo: string | null
  type: string
  reason: string | null
}

export interface PreviewRecentFormGame {
  fixtureId: number
  date: string
  statusShort: string
  league: {
    id: number
    name: string
    logo: string | null
    season: number | null
    round: string | null
  }
  venue: 'home' | 'away'
  /** O adversário daquele jogo. `logo` é a URL da API-Football. */
  opponent: { id: number; name: string; logo: string | null }
  goalsFor: number | null
  goalsAgainst: number | null
  result: 'W' | 'D' | 'L' | null
}

export interface PreviewRecentFormSide {
  teamId: number
  played: number
  wins: number
  draws: number
  losses: number
  games: PreviewRecentFormGame[]
}

export interface PreviewRecentForm {
  home: PreviewRecentFormSide | null
  away: PreviewRecentFormSide | null
}

export interface MatchPreview {
  matchId: string
  hasApiFixtureId: boolean
  prediction: PreviewProbability | null
  venue: PreviewVenue | null
  referee: string | null
  lineups: PreviewLineup[]
  injuries: PreviewInjury[]
  recentForm: PreviewRecentForm
}

export function getMatchPreview(matchId: string): Promise<MatchPreview> {
  return apiGet(`/api/matches/${matchId}/preview`)
}
