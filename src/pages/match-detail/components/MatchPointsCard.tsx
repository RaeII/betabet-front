import { Trophy } from 'lucide-react'
import { useMatchMyPoints } from '@/hooks/useMatchPoints'
import type { MatchMyPoints } from '@/services/matchPoints.service'

interface MatchPointsCardProps {
  matchId: string
  groupId: string
}

interface StateMeta {
  badge: string
  badgeClass: string
  caption: string
  /** Cor do número de pontos. */
  accentClass: string
}

function stateMeta(data: MatchMyPoints): StateMeta {
  const { state, matchPoints } = data
  if (state === 'live') {
    return {
      badge: '● Ao vivo',
      badgeClass: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600',
      caption: 'ganhando agora — muda com o placar',
      accentClass: 'text-[var(--brand)]',
    }
  }
  if (state === 'finished' && matchPoints.confirmed) {
    return {
      badge: 'Confirmado',
      badgeClass: 'border-green-500/30 bg-green-500/10 text-green-600',
      caption: 'pontos garantidos nesta partida',
      accentClass: matchPoints.total > 0 ? 'text-green-600' : 'text-[var(--text-muted)]',
    }
  }
  // finished mas ainda não liquidado (entre o apito e o cron de liquidação)
  return {
    badge: 'Provisório',
    badgeClass: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600',
    caption: 'aguardando confirmação',
    accentClass: 'text-[var(--brand)]',
  }
}

export function MatchPointsCard({ matchId, groupId }: MatchPointsCardProps) {
  const { data } = useMatchMyPoints(matchId, groupId)

  // Antes do jogo não há pontos em jogo — o BetForm já cobre esse estado.
  if (!data || data.state === 'scheduled') return null

  const { matchPoints, bet, liveScore, totalBeforeMatch, totalWithMatch } = data
  const meta = stateMeta(data)
  const delta = totalWithMatch - totalBeforeMatch

  return (
    <section className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
      <header className="flex items-baseline justify-between gap-3">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-[var(--brand)]" aria-hidden />
          <h3 className="text-base font-semibold tracking-tight text-[var(--text)] sm:text-lg">
            Seus pontos
          </h3>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${meta.badgeClass}`}
        >
          {meta.badge}
        </span>
      </header>

      {bet ? (
        <>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className={`text-4xl font-bold tabular-nums leading-none ${meta.accentClass}`}>
                {matchPoints.total > 0 ? '+' : ''}
                {matchPoints.total}
                <span className="ml-1 text-base font-semibold text-[var(--text-muted)]">pts</span>
              </p>
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">{meta.caption}</p>
            </div>
            <div className="text-right text-xs text-[var(--text-muted)]">
              <p>
                Palpite{' '}
                <span className="font-semibold text-[var(--text)]">
                  {bet.homeScore} × {bet.awayScore}
                </span>
              </p>
              {liveScore && liveScore.home !== null && liveScore.away !== null ? (
                <p className="mt-0.5">
                  Placar{' '}
                  <span className="font-semibold text-[var(--text)]">
                    {liveScore.home} × {liveScore.away}
                  </span>
                </p>
              ) : null}
            </div>
          </div>

          {matchPoints.total > 0 ? (
            <div className="flex flex-wrap gap-2">
              {matchPoints.result > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-medium text-[var(--text)]">
                  Resultado
                  <span className="font-bold text-[var(--brand)]">+{matchPoints.result}</span>
                </span>
              ) : null}
              {matchPoints.exactScore > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-medium text-[var(--text)]">
                  Placar exato
                  <span className="font-bold text-[var(--brand)]">+{matchPoints.exactScore}</span>
                </span>
              ) : null}
            </div>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">
          Você não palpitou nesta partida — nenhum ponto em jogo.
        </p>
      )}

      <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs">
        <span className="text-[var(--text-muted)]">Total no grupo</span>
        <span className="flex items-baseline gap-1.5 tabular-nums">
          {delta > 0 ? (
            <span className="text-[var(--text-muted)]">{totalBeforeMatch} →</span>
          ) : null}
          <span className="text-sm font-bold text-[var(--text)]">{totalWithMatch} pts</span>
        </span>
      </div>
    </section>
  )
}
