import { http, HttpResponse } from 'msw'
import type { MatchesResponse, Match } from '@/types/match.types'

const mockTeamBR = { id: 't-br', name: 'Brasil', flagUrl: '/flags/br.svg', group: 'A' }
const mockTeamAR = { id: 't-ar', name: 'Argentina', flagUrl: '/flags/ar.svg', group: 'A' }
const mockTeamFR = { id: 't-fr', name: 'França', flagUrl: '/flags/fr.svg', group: 'B' }
const mockTeamLong = {
  id: 't-long',
  name: 'Seleção Internacional de Nome Muito Longo',
  flagUrl: '/flags/long.svg',
  group: 'B',
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

export const mockMatchesResponse: MatchesResponse = {
  groupStage: {
    A: {
      '1': [mockMatch],
    },
    B: {
      '1': [mockFinishedMatch],
    },
  },
  knockout: {},
}

export const matchesHandlers = [
  http.get('/api/matches', () => {
    return HttpResponse.json(mockMatchesResponse)
  }),

  http.get('/api/matches/:matchId', ({ params }) => {
    const match = [mockMatch, mockFinishedMatch].find(item => item.id === params.matchId) ?? mockMatch
    return HttpResponse.json({
      ...match,
      id: params.matchId as string,
      userBet: null,
    })
  }),
]
