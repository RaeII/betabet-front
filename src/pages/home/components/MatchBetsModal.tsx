import { useQuery } from '@tanstack/react-query'
import { ReferralUnlockPanel } from '@/components/referral/ReferralUnlockPanel'
import { Modal } from '@/components/ui/modal'
import { useAuth } from '@/hooks/useAuth'
import { useReferralInfo } from '@/hooks/useReferral'
import { formatScore } from '@/lib/format.utils'
import { getGroupMatchBets } from '@/services/bets.service'
import type { MatchWithUserBet } from '@/types/match.types'

interface MatchBetsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  match: MatchWithUserBet
  groupId: string
  groupInviteCode?: string
}

export function MatchBetsModal({
  open,
  onOpenChange,
  match,
  groupId,
  groupInviteCode,
}: MatchBetsModalProps) {
  const { user } = useAuth()
  const { data: referralInfo } = useReferralInfo(open)
  const { data, isError, isLoading } = useQuery({
    queryKey: ['group-match-bets', groupId, match.id],
    queryFn: () => getGroupMatchBets(groupId, match.id),
    enabled: open,
  })

  const bets = data?.bets ?? []
  const matchLabel = `${match.homeTeam.name} × ${match.awayTeam.name}`
  const referralCount = referralInfo?.count ?? user?.referralCount ?? 0
  const referralCode = referralInfo?.code ?? user?.referralCode

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Palpites"
      description={matchLabel}
    >
      <div className="space-y-3 p-5">
        {isLoading ? (
          <div className="space-y-2" aria-label="Carregando palpites">
            {[0, 1, 2].map(index => (
              <div
                key={index}
                className="h-14 rounded-[var(--radius-lg)] bg-[var(--surface-soft)]"
              />
            ))}
          </div>
        ) : null}

        {isError ? (
          <p role="alert" className="text-sm text-[var(--danger)]">
            Não foi possível carregar os palpites. Tente novamente.
          </p>
        ) : null}

        {!isLoading && !isError && data && !data.canView ? (
          <ReferralUnlockPanel
            featureName="a visualização de palpites"
            referralCount={referralCount}
            referralCode={referralCode}
            groupInviteCode={groupInviteCode}
          />
        ) : null}

        {!isLoading && !isError && data?.canView && bets.length === 0 ? (
          <p className="py-3 text-center text-sm text-[var(--text-muted)]">
            Nenhum palpite neste jogo ainda.
          </p>
        ) : null}

        {!isLoading && !isError && data?.canView && bets.length > 0 ? (
          <div className="space-y-2">
            {bets.map(bet => (
              <div
                key={bet.id}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-soft)] text-sm font-bold text-[var(--brand)]">
                    {bet.user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="min-w-0 truncate text-sm font-semibold text-[var(--text)]">
                    {bet.user.id === user?.id ? 'Você' : bet.user.name}
                  </span>
                </div>
                <span className="shrink-0 text-lg font-bold tabular-nums text-[var(--text)]">
                  {formatScore(bet.homeScore, bet.awayScore)}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
