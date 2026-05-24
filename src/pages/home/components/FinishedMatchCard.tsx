import type { BettingGroup } from '@/types/group.types'
import type { MatchWithUserBet } from '@/types/match.types'
import { calcPoints } from '@/lib/bet.utils'
import { formatMatchDate } from '@/lib/date.utils'

interface FinishedMatchCardProps {
  match: MatchWithUserBet
  group: Pick<BettingGroup, 'resultPoints' | 'exactScorePoints'>
}

function FlagOrInitial({ name, flagUrl }: { name: string; flagUrl: string }) {
  if (flagUrl) {
    return (
      <img
        src={flagUrl}
        alt={name}
        className="h-8 w-8 rounded-full border border-[var(--border)] object-cover"
      />
    )
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-soft)] text-xs font-bold text-[var(--brand)]">
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

export function FinishedMatchCard({ match, group }: FinishedMatchCardProps) {
  const hasOfficial = match.homeScore !== null && match.awayScore !== null
  const userBet = match.userBet
  const points = hasOfficial && userBet
    ? calcPoints(
        userBet.homeScore,
        userBet.awayScore,
        match.homeScore!,
        match.awayScore!,
        group,
      )
    : null

  return (
    <article className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <header className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span className="uppercase tracking-[0.12em]">Encerrado</span>
        <span>{formatMatchDate(match.scheduledAt)}</span>
      </header>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <FlagOrInitial name={match.homeTeam.name} flagUrl={match.homeTeam.flagUrl} />
          <span className="truncate text-sm font-semibold text-[var(--text)]">
            {match.homeTeam.name}
          </span>
        </div>

        {hasOfficial ? (
          <div className="flex items-center gap-2 text-lg font-bold tabular-nums text-[var(--text)]">
            <span>{match.homeScore}</span>
            <span className="text-[var(--text-muted)]">×</span>
            <span>{match.awayScore}</span>
          </div>
        ) : (
          <span
            role="status"
            className="rounded-[var(--radius-pill)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]"
          >
            Resultado pendente
          </span>
        )}

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span className="truncate text-right text-sm font-semibold text-[var(--text)]">
            {match.awayTeam.name}
          </span>
          <FlagOrInitial name={match.awayTeam.name} flagUrl={match.awayTeam.flagUrl} />
        </div>
      </div>

      <footer className="border-t border-[var(--border)] pt-3 text-sm">
        {userBet ? (
          <p className="text-[var(--text)]">
            Seu palpite:{' '}
            <strong>
              {userBet.homeScore} × {userBet.awayScore}
            </strong>
            {hasOfficial && points !== null ? (
              <>
                {' — '}
                <strong className="text-[var(--brand)]">
                  {points} {points === 1 ? 'ponto' : 'pontos'}
                </strong>
              </>
            ) : null}
          </p>
        ) : (
          <p className="text-[var(--text-muted)]">Você não palpitou.</p>
        )}
      </footer>
    </article>
  )
}
