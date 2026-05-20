import { http, HttpResponse } from 'msw'
import type { BettingGroup, GroupMembership, RankingEntry } from '@/types/group.types'

const mockGroup: BettingGroup = {
  id: 'group-1',
  name: 'Bolão dos Amigos',
  coverUrl: null,
  adminId: 'user-1',
  resultPoints: 1,
  exactScorePoints: 3,
  showBetsBeforeKickoff: false,
  joinMode: 'request',
  memberCount: 3,
  inviteCode: 'ABC12345',
  createdAt: new Date().toISOString(),
}

const mockMembership: GroupMembership = {
  groupId: 'group-1',
  userId: 'user-1',
  role: 'admin',
  joinedAt: new Date().toISOString(),
  user: { id: 'user-1', name: 'Admin User', avatarUrl: null },
}

const mockRanking: RankingEntry[] = [
  { userId: 'user-1', userName: 'Admin User', avatarUrl: null, position: 1, totalPoints: 10, exactScorePredictions: 2, totalBets: 5 },
  { userId: 'user-2', userName: 'Member', avatarUrl: null, position: 2, totalPoints: 5, exactScorePredictions: 1, totalBets: 4 },
]

export const groupsHandlers = [
  http.get('/api/groups', () => {
    return HttpResponse.json({ groups: [mockGroup] })
  }),

  http.post('/api/groups', async ({ request }) => {
    const body = await request.json() as Partial<BettingGroup>
    return HttpResponse.json({ group: { ...mockGroup, ...body, id: 'new-group-1' } })
  }),

  http.get('/api/groups/:groupId', ({ params }) => {
    return HttpResponse.json({ group: { ...mockGroup, id: params.groupId as string }, role: 'admin' })
  }),

  http.put('/api/groups/:groupId', async ({ params, request }) => {
    const body = await request.json() as Partial<BettingGroup>
    return HttpResponse.json({ group: { ...mockGroup, id: params.groupId as string, ...body } })
  }),

  http.get('/api/groups/:groupId/members', () => {
    return HttpResponse.json({ members: [mockMembership] })
  }),

  http.delete('/api/groups/:groupId/members/:userId', () => {
    return HttpResponse.json({ ok: true })
  }),

  http.get('/api/groups/:groupId/ranking', () => {
    return HttpResponse.json({ ranking: mockRanking, updatedAt: new Date().toISOString() })
  }),

  http.get('/api/groups/:groupId/matches/:matchId/bets', () => {
    return HttpResponse.json({ bets: [], canView: false })
  }),

  http.get('/api/groups/:groupId/join-requests', () => {
    return HttpResponse.json({ requests: [] })
  }),

  http.post('/api/groups/:groupId/join', () => {
    return HttpResponse.json({ ok: true })
  }),

  http.get('/api/invite/:code', () => {
    return HttpResponse.json({ group: mockGroup })
  }),
]
