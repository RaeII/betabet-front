import { apiGet, apiPost } from './api'

export interface ApiFootballLeague {
  league: { id: number; name: string; type: string; logo: string }
  country: { name: string; code: string | null; flag: string | null }
  seasons: Array<{ year: number; start: string; end: string; current: boolean }>
}

export interface ApiFootballTeam {
  team: { id: number; name: string; code: string | null; country: string; national: boolean; logo: string }
  venue: { id: number | null; name: string | null; city: string | null }
}

export interface ApiFootballFixture {
  fixture: {
    id: number
    date: string
    timestamp: number
    venue: { id: number | null; name: string | null; city: string | null }
    status: { long: string; short: string; elapsed: number | null }
  }
  league: { id: number; name: string; country: string; logo: string; season: number; round: string }
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null }
    away: { id: number; name: string; logo: string; winner: boolean | null }
  }
  goals: { home: number | null; away: number | null }
}

interface Meta {
  results: number
  cachedAt: string
  staleAt: string
  paging?: { current: number; total: number }
}

interface Wrapped<T> {
  data: T[]
  meta: Meta
}

function qs(params: Record<string, string | number | boolean | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  if (entries.length === 0) return ''
  const search = new URLSearchParams()
  for (const [k, v] of entries) search.set(k, String(v))
  return `?${search.toString()}`
}

export function listLeagues(params: {
  search?: string
  country?: string
  season?: number
  current?: boolean
  id?: number
}): Promise<Wrapped<ApiFootballLeague>> {
  return apiGet(`/api/admin/api-football/leagues${qs(params)}`)
}

export function listTeams(params: {
  league?: number
  season?: number
  search?: string
  country?: string
  id?: number
}): Promise<Wrapped<ApiFootballTeam>> {
  return apiGet(`/api/admin/api-football/teams${qs(params)}`)
}

export interface RegisterFriendlyMatchResponse {
  match: {
    id: string
    homeTeam: { id: string; name: string; flagUrl: string }
    awayTeam: { id: string; name: string; flagUrl: string }
    stadium: { id: string; name: string; city: string }
    scheduledAt: string
    status: string
    phase: string
  }
  league: {
    apiLeagueId: number
    name: string
    country: string
    season: number
    round: string
  }
}

export function registerFriendlyMatch(apiFixtureId: number): Promise<RegisterFriendlyMatchResponse> {
  return apiPost(`/api/admin/friendly-matches/${apiFixtureId}`)
}

export function listFixtures(params: {
  league?: number
  season?: number
  team?: number
  next?: number
  last?: number
  date?: string
  from?: string
  to?: string
  status?: string
  live?: string
}): Promise<Wrapped<ApiFootballFixture>> {
  return apiGet(`/api/admin/api-football/fixtures${qs(params)}`)
}
