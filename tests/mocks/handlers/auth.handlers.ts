import { http, HttpResponse } from 'msw'
import type { User } from '@/types/auth.types'

const mockUser: User = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  avatarUrl: null,
  referralCode: 'TEST1234',
  referredByCode: null,
  referralCount: 1,
  chartUnlocked: false,
  isAdmin: false,
  createdAt: '2026-05-19T00:00:00.000Z',
}

export const authHandlers = [
  http.get('/api/auth/me', () => HttpResponse.json({ user: mockUser })),
  http.post('/api/auth/login', () =>
    HttpResponse.json({ message: 'Autenticação por senha foi removida.' }, { status: 410 }),
  ),
  http.post('/api/auth/login/request-code', () =>
    HttpResponse.json({
      challengeId: '11111111-1111-4111-8111-111111111111',
      expiresAt: '2026-05-19T00:10:00.000Z',
      resendAvailableAt: '2026-05-19T00:01:00.000Z',
      debugCode: '123456',
    }, { status: 202 }),
  ),
  http.post('/api/auth/login/verify-code', () => HttpResponse.json({ user: mockUser })),
  http.post('/api/auth/logout', () => HttpResponse.json({ ok: true })),
  http.post('/api/auth/register', () =>
    HttpResponse.json({ message: 'Autenticação por senha foi removida.' }, { status: 410 }),
  ),
  http.post('/api/auth/register/request-code', () =>
    HttpResponse.json({
      challengeId: '22222222-2222-4222-8222-222222222222',
      expiresAt: '2026-05-19T00:10:00.000Z',
      resendAvailableAt: '2026-05-19T00:01:00.000Z',
      debugCode: '123456',
    }, { status: 202 }),
  ),
  http.post('/api/auth/register/verify-code', () =>
    HttpResponse.json({ user: mockUser }, { status: 201 }),
  ),
]
