import { apiGet } from './api'
import type { PreviewLineup } from './matchPreview.service'

export interface LiveStatus {
  short: string // "1H" | "HT" | "2H" | "ET" | "BT" | "P" | "SUSP" | "INT" | "LIVE" | "FT" | "AET" | "PEN" | ...
  long: string
  elapsed: number | null
  extra: number | null
}

export interface LiveScoreSplit {
  home: number | null
  away: number | null
}

export interface LiveEvent {
  minute: number
  extra: number | null
  teamId: number
  teamName: string
  player: string
  assist: string | null
  type: string // "Goal" | "Card" | "subst" | "Var"
  detail: string
  comments: string | null
}

export interface LiveTeamStats {
  teamId: number
  teamName: string
  logo: string
  statistics: Array<{ type: string; value: number | string | null }>
}

export interface LiveTeamRef {
  id: number
  name: string
  logo: string
}

export interface MatchLive {
  matchId: string
  hasApiFixtureId: boolean
  isLive: boolean
  status: LiveStatus
  goals: { home: number | null; away: number | null }
  score: {
    halftime: LiveScoreSplit
    fulltime: LiveScoreSplit
    extratime: LiveScoreSplit
    penalty: LiveScoreSplit
  }
  league: { round: string | null; season: number | null } | null
  venue: { name: string | null; city: string | null } | null
  referee: string | null
  teams: { home: LiveTeamRef; away: LiveTeamRef } | null
  events: LiveEvent[]
  lineups: PreviewLineup[]
  statistics: LiveTeamStats[]
  cachedAt: string | null
  staleAt: string | null
}

export function getMatchLive(matchId: string): Promise<MatchLive> {
  return apiGet(`/api/matches/${matchId}/live`)
}
