import { apiGet, apiPost } from './api'
import type { ReferralInfo } from '@/types/referral.types'

interface ReferralApiInfo {
  referralCode: string
  referralCount: number
  chartUnlocked: boolean
  referredUsers: ReferralInfo['referredUsers']
}

type ReferralApiResponse =
  | ReferralInfo
  | {
      referral: ReferralApiInfo
    }

function buildReferralLink(code: string) {
  if (!code || typeof window === 'undefined') return ''
  return `${window.location.origin}/?ref=${encodeURIComponent(code)}`
}

function normalizeReferralInfo(response: ReferralApiResponse): ReferralInfo {
  if ('referral' in response) {
    return {
      code: response.referral.referralCode,
      link: buildReferralLink(response.referral.referralCode),
      count: response.referral.referralCount,
      isUnlocked: response.referral.chartUnlocked,
      referredUsers: response.referral.referredUsers,
    }
  }

  return response
}

export function getReferralInfo(): Promise<ReferralInfo> {
  return apiGet<ReferralApiResponse>('/api/referral').then(normalizeReferralInfo)
}

export function applyReferralCode(code: string): Promise<{ ok: boolean }> {
  return apiPost('/api/referral/apply', { referralCode: code })
}
