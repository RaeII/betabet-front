import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { applyReferralCode, getReferralInfo } from '@/services/referral.service'

export const referralKeys = {
  info: ['referral', 'info'] as const,
}

export function useReferralInfo() {
  return useQuery({
    queryKey: referralKeys.info,
    queryFn: getReferralInfo,
  })
}

export function useApplyReferralCode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => applyReferralCode(code),
    onSuccess: () => qc.invalidateQueries({ queryKey: referralKeys.info }),
  })
}
