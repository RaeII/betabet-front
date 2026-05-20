import { http, HttpResponse } from 'msw'
import type { User } from '@/types/auth.types'

const mockUser: User = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  avatarUrl: null,
  referralCode: 'TEST1234',
  referredByCode: null,
  referralCount: 0,
  chartUnlocked: false,
  isAdmin: false,
  createdAt: '2026-05-19T00:00:00.000Z',
}

export const authHandlers = [
  http.get('/api/auth/me', () => HttpResponse.json({ user: mockUser })),
  http.post('/api/auth/login', () => HttpResponse.json({ user: mockUser })),
  http.post('/api/auth/logout', () => HttpResponse.json({ ok: true })),
  http.post('/api/auth/register', () =>
    HttpResponse.json({ user: mockUser }, { status: 201 }),
  ),
]
