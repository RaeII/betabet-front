export interface WorldCupApiMeta {
  results: number
  paging?: { current: number; total: number }
  cachedAt: string
  staleAt: string
}

export interface WorldCupStandingStats {
  played: number
  win: number
  draw: number
  lose: number
  goals: { for: number; against: number }
}

export interface WorldCupStanding {
  rank: number
  team: { id: number; name: string; logo: string }
  points: number
  goalsDiff: number
  group: string
  form: string | null
  status: 'same' | 'up' | 'down' | null
  description: string | null
  all: WorldCupStandingStats
  home: WorldCupStandingStats
  away: WorldCupStandingStats
  update?: string
}

export interface WorldCupStandingsResponse {
  data: {
    league: {
      id: number
      name: string
      country: string
      logo: string
      flag: string | null
      season: number
      standings: WorldCupStanding[][]
    }
  }
  meta: WorldCupApiMeta
}
