import { http, HttpResponse } from 'msw'
import type { MatchesResponse, Match } from '@/types/match.types'
import type { WorldCupStandingsResponse, WorldCupStanding } from '@/types/worldCup.types'

const mockTeamBR = {
  id: 't-br',
  apiTeamId: 770,
  name: 'Brasil',
  flagUrl: '/flags/br.svg',
  group: 'A',
}
const mockTeamAR = {
  id: 't-ar',
  apiTeamId: 771,
  name: 'Argentina',
  flagUrl: '/flags/ar.svg',
  group: 'A',
}
const mockTeamDE = {
  id: 't-de',
  apiTeamId: 772,
  name: 'Alemanha',
  flagUrl: '/flags/de.svg',
  group: 'A',
}
const mockTeamES = {
  id: 't-es',
  apiTeamId: 773,
  name: 'Espanha',
  flagUrl: '/flags/es.svg',
  group: 'A',
}
const mockTeamFR = {
  id: 't-fr',
  apiTeamId: 774,
  name: 'França',
  flagUrl: '/flags/fr.svg',
  group: 'B',
}
const mockTeamLong = {
  id: 't-long',
  apiTeamId: 775,
  name: 'Seleção Internacional de Nome Muito Longo',
  flagUrl: '/flags/long.svg',
  group: 'B',
}
const mockTeamJP = {
  id: 't-jp',
  apiTeamId: 779,
  name: 'Japão',
  flagUrl: '/flags/jp.svg',
  group: 'I',
}
const mockTeamUY = {
  id: 't-uy',
  apiTeamId: 780,
  name: 'Uruguai',
  flagUrl: '/flags/uy.svg',
  group: 'I',
}
const mockStadium = { id: 's-1', name: 'Estádio Nacional', city: 'Brasília' }

export const mockMatch: Match = {
  id: 'match-1',
  homeTeam: mockTeamBR,
  awayTeam: mockTeamAR,
  stadium: mockStadium,
  scheduledAt: new Date(Date.now() + 2 * 60 * 60_000).toISOString(),
  status: 'upcoming',
  phase: 'group',
  groupName: 'A',
  matchday: 1,
  homeScore: null,
  awayScore: null,
}

export const mockFinishedMatch: Match = {
  id: 'match-2',
  homeTeam: mockTeamFR,
  awayTeam: mockTeamLong,
  stadium: mockStadium,
  scheduledAt: new Date(Date.now() - 2 * 60 * 60_000).toISOString(),
  status: 'finished',
  phase: 'group',
  groupName: 'B',
  matchday: 1,
  homeScore: 2,
  awayScore: 1,
}

export const mockSecondRoundMatch: Match = {
  id: 'match-3',
  homeTeam: mockTeamDE,
  awayTeam: mockTeamES,
  stadium: mockStadium,
  scheduledAt: new Date(Date.now() + 26 * 60 * 60_000).toISOString(),
  status: 'upcoming',
  phase: 'group',
  groupName: 'A',
  matchday: 2,
  homeScore: null,
  awayScore: null,
}

export const mockGroupIMatch: Match = {
  id: 'match-4',
  homeTeam: mockTeamJP,
  awayTeam: mockTeamUY,
  stadium: mockStadium,
  scheduledAt: new Date(Date.now() + 50 * 60 * 60_000).toISOString(),
  status: 'upcoming',
  phase: 'group',
  groupName: 'I',
  matchday: 1,
  homeScore: null,
  awayScore: null,
}

export const mockMatchesResponse: MatchesResponse = {
  groupStage: {
    A: {
      matchday1: [mockMatch],
      matchday2: [mockSecondRoundMatch],
    },
    B: {
      matchday1: [mockFinishedMatch],
    },
    I: {
      matchday1: [mockGroupIMatch],
    },
  },
  knockout: {},
}

function standing(
  rank: number,
  team: { id: number; name: string; logo: string },
  points: number,
  group: string,
  description: string | null,
): WorldCupStanding {
  return {
    rank,
    team,
    points,
    goalsDiff: points,
    group,
    form: null,
    status: 'same',
    description,
    all: {
      played: points > 0 ? 2 : 0,
      win: points > 0 ? Math.floor(points / 3) : 0,
      draw: points % 3,
      lose: 0,
      goals: { for: points, against: 0 },
    },
    home: { played: 0, win: 0, draw: 0, lose: 0, goals: { for: 0, against: 0 } },
    away: { played: 0, win: 0, draw: 0, lose: 0, goals: { for: 0, against: 0 } },
    update: '2026-06-15T18:00:00.000Z',
  }
}

export const mockWorldCupStandingsResponse: WorldCupStandingsResponse = {
  data: {
    league: {
      id: 1,
      name: 'World Cup',
      country: 'World',
      logo: '/league.svg',
      flag: null,
      season: 2026,
      standings: [
        [
          standing(
            1,
            { id: 770, name: 'Brazil', logo: '/api-football/br.png' },
            6,
            'Group A',
            'Promotion',
          ),
          standing(2, { id: 771, name: 'Argentina', logo: '/flags/ar.svg' }, 3, 'Group A', 'Promotion'),
          standing(3, { id: 772, name: 'Alemanha', logo: '/flags/de.svg' }, 1, 'Group A', null),
          standing(4, { id: 773, name: 'Espanha', logo: '/flags/es.svg' }, 0, 'Group A', null),
        ],
        [
          standing(1, { id: 774, name: 'França', logo: '/flags/fr.svg' }, 3, 'Group B', 'Promotion'),
          standing(2, { id: 775, name: 'Seleção Internacional de Nome Muito Longo', logo: '/flags/long.svg' }, 0, 'Group B', null),
        ],
        [
          standing(1, { id: 779, name: 'Japan', logo: '/api-football/jp.png' }, 3, 'Group I', 'Promotion'),
          standing(2, { id: 780, name: 'Uruguai', logo: '/api-football/uy.png' }, 0, 'Group I', null),
        ],
        [
          standing(
            1,
            { id: 999, name: 'Third-placed Teams', logo: '/api-football/third.png' },
            0,
            'Ranking of third-placed teams',
            null,
          ),
        ],
      ],
    },
  },
  meta: {
    results: 1,
    cachedAt: '2026-06-15T18:00:00.000Z',
    staleAt: '2026-06-15T19:00:00.000Z',
  },
}

export const matchesHandlers = [
  http.get('/api/matches', () => {
    return HttpResponse.json(mockMatchesResponse)
  }),

  http.get('/api/api-football/world-cup/standings', () => {
    return HttpResponse.json(mockWorldCupStandingsResponse)
  }),

  http.get('/api/matches/:matchId', ({ params }) => {
    const match =
      [mockMatch, mockFinishedMatch, mockSecondRoundMatch, mockGroupIMatch].find(
        item => item.id === params.matchId,
      ) ?? mockMatch
    return HttpResponse.json({
      ...match,
      id: params.matchId as string,
      userBet: null,
    })
  }),
]
