import { http, HttpResponse } from 'msw'
import type { ReferralInfo } from '@/types/referral.types'

export const mockReferralInfo: ReferralInfo = {
  code: 'ABC12345',
  link: 'https://example.com/invite/ABC12345',
  count: 2,
  isUnlocked: false,
  referredUsers: [
    { id: 'user-2', name: 'Maria', joinedAt: new Date().toISOString() },
    { id: 'user-3', name: 'João', joinedAt: new Date().toISOString() },
  ],
}

export const referralHandlers = [
  http.get('/api/referral', () => {
    return HttpResponse.json(mockReferralInfo)
  }),

  http.post('/api/referral/apply', async ({ request }) => {
    const body = await request.json() as { code?: string; referralCode?: string }
    if (!body.referralCode && !body.code) {
      return HttpResponse.json({ error: 'Code required', code: 'VALIDATION_ERROR' }, { status: 400 })
    }
    return HttpResponse.json({ ok: true })
  }),
]
