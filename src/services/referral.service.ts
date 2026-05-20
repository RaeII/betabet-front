import { apiGet, apiPost } from './api'
import type { ReferralInfo } from '@/types/referral.types'

export function getReferralInfo(): Promise<ReferralInfo> {
  return apiGet('/api/referral')
}

export function applyReferralCode(code: string): Promise<{ ok: boolean }> {
  return apiPost('/api/referral/apply', { code })
}
