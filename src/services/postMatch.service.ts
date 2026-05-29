import { apiGet } from './api'
import type { LiveEvent, LiveScoreSplit, LiveTeamStats } from './liveMatch.service'
import type { PreviewLineup } from './matchPreview.service'

export interface PostMatchStatus {
  short: string // "FT" | "AET" | "PEN"
  long: string
  elapsed: number | null
  extra: number | null
}

export interface PostMatchTeamRef {
  id: number
  name: string
  logo: string
  winner: boolean | null
}

export interface MatchPostMatch {
  matchId: string
  hasPostMatchData: boolean
  status: PostMatchStatus
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
  teams: { home: PostMatchTeamRef; away: PostMatchTeamRef } | null
  events: LiveEvent[]
  lineups: PreviewLineup[]
  statistics: LiveTeamStats[]
  fetchedAt: string | null
}

export function getMatchPostMatch(matchId: string): Promise<MatchPostMatch> {
  return apiGet(`/api/matches/${matchId}/post-match`)
}
