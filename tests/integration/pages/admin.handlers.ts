import { http, HttpResponse } from 'msw'
import type { AdminStats } from '@/types/admin.types'

const mockStats: AdminStats = {
  totalUsers: 150,
  totalGroups: 20,
  totalBets: 1200,
}

export const adminHandlers = [
  http.post('/api/admin/auth/login', () => {
    return HttpResponse.json({ ok: true })
  }),

  http.get('/api/admin/stats', () => {
    return HttpResponse.json(mockStats)
  }),

  http.get('/api/admin/matches', () => {
    return HttpResponse.json({ matches: [] })
  }),

  http.post('/api/admin/matches/:matchId/result', async ({ request }) => {
    const body = await request.json() as { homeScore: number; awayScore: number }
    return HttpResponse.json({ match: { id: 'match-1', homeScore: body.homeScore, awayScore: body.awayScore }, betsProcessed: 10 })
  }),

  http.get('/api/admin/analytics/matches', () => {
    return HttpResponse.json({ analytics: [] })
  }),
]
