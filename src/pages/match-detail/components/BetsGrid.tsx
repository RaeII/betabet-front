import { EmojiPicker } from './EmojiPicker'
import { ReferralUnlockPanel } from '@/components/referral/ReferralUnlockPanel'
import { formatScore } from '@/lib/format.utils'
import { useAuth } from '@/hooks/useAuth'
import { useReferralInfo } from '@/hooks/useReferral'
import type { BetWithUser } from '@/types/bet.types'

interface BetsGridProps {
  bets: BetWithUser[]
  canView: boolean
  groupInviteCode?: string
}

export function BetsGrid({ bets, canView, groupInviteCode }: BetsGridProps) {
  const { user } = useAuth()
  const { data: referralInfo } = useReferralInfo(!canView)
  const referralCount = referralInfo?.count ?? user?.referralCount ?? 0
  const referralCode = referralInfo?.code ?? user?.referralCode

  if (!canView) {
    return (
      <ReferralUnlockPanel
        featureName="a visualização de palpites"
        referralCount={referralCount}
        referralCode={referralCode}
        groupInviteCode={groupInviteCode}
      />
    )
  }

  if (bets.length === 0) {
    return (
      <p className="text-center text-sm text-[var(--text-muted)]">Nenhuma aposta ainda.</p>
    )
  }

  return (
    <div className="space-y-3">
      {bets.map(bet => (
        <div
          key={bet.id}
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-soft)] text-sm font-bold text-[var(--brand)]">
              {bet.user.avatarUrl ? (
                <img src={bet.user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                bet.user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--text)]">{bet.user.name}</p>
              <p className="text-lg font-bold text-[var(--text)]">
                {formatScore(bet.homeScore, bet.awayScore)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
