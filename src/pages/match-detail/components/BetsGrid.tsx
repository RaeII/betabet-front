import { EmojiPicker } from './EmojiPicker'
import { formatScore } from '@/lib/format.utils'
import { useAuth } from '@/hooks/useAuth'
import type { BetWithUser } from '@/types/bet.types'

interface BetsGridProps {
  bets: BetWithUser[]
  canView: boolean
}

export function BetsGrid({ bets, canView }: BetsGridProps) {
  const { user } = useAuth()

  if (!canView) {
    return (
      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-center text-sm text-[var(--text-muted)]">
        As apostas serão reveladas quando a partida começar.
      </div>
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
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-soft)] text-sm font-bold text-[var(--brand)]">
              {bet.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--text)]">{bet.user.name}</p>
              <p className="text-lg font-bold text-[var(--text)]">
                {formatScore(bet.homeScore, bet.awayScore)}
              </p>
            </div>
          </div>
          {user && (
            <div className="mt-3">
              <EmojiPicker
                betId={bet.id}
                reactions={bet.reactions}
                currentUserId={user.id}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
