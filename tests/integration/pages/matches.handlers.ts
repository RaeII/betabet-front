import { http, HttpResponse } from 'msw'
import type { MatchesResponse, Match } from '@/types/match.types'

const mockTeamBR = { id: 't-br', name: 'Brasil', flagUrl: '/flags/br.svg', group: 'A' }
const mockTeamAR = { id: 't-ar', name: 'Argentina', flagUrl: '/flags/ar.svg', group: 'A' }
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

export const mockMatchesResponse: MatchesResponse = {
  groupStage: {
    A: {
      '1': [mockMatch],
    },
  },
  knockout: {},
}

export const matchesHandlers = [
  http.get('/api/matches', () => {
    return HttpResponse.json(mockMatchesResponse)
  }),

  http.get('/api/matches/:matchId', ({ params }) => {
    return HttpResponse.json({
      ...mockMatch,
      id: params.matchId as string,
      userBet: null,
    })
  }),
]
