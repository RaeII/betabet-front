import { http, HttpResponse } from 'msw'
import type { Bet } from '@/types/bet.types'

const mockBet: Bet = {
  id: 'bet-1',
  matchId: 'match-1',
  userId: 'user-1',
  groupId: 'group-1',
  homeScore: 2,
  awayScore: 1,
  resultPoints: null,
  exactScorePoints: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const betsHandlers = [
  http.post('/api/bets', async ({ request }) => {
    const body = await request.json() as { matchId?: string; homeScore?: number; awayScore?: number }
    return HttpResponse.json({
      bets: [{ ...mockBet, homeScore: body.homeScore ?? 0, awayScore: body.awayScore ?? 0 }],
    })
  }),

  http.put('/api/bets/:betId', async ({ request }) => {
    const body = await request.json() as { homeScore?: number; awayScore?: number }
    return HttpResponse.json({
      bet: { ...mockBet, ...body },
    })
  }),
]
