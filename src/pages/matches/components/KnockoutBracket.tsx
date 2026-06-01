import { MatchCard } from '@/components/match/MatchCard'
import type { Match, MatchesResponse } from '@/types/match.types'

const PHASE_LABELS: Record<string, string> = {
  r16: 'Oitavas',
  qf: 'Quartas',
  sf: 'Semis',
  final: 'Final',
}

const PHASE_ORDER = ['r16', 'qf', 'sf', 'final']

interface KnockoutBracketProps {
  data: MatchesResponse['knockout']
  groupId?: string
}

export function KnockoutBracket({ data, groupId }: KnockoutBracketProps) {
  const phases = PHASE_ORDER.filter(p => data[p]?.length > 0)

  if (phases.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-[var(--text-muted)]">
        Mata-mata ainda não iniciado.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max gap-4 pb-3">
        {phases.map(phase => (
          <section key={phase} className="w-[21rem] space-y-3 sm:w-[26rem]">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-[var(--border)]" />
              <h3 className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                {PHASE_LABELS[phase] ?? phase}
              </h3>
              <span className="h-px flex-1 bg-[var(--border)]" />
            </div>
            <div className="space-y-3">
              {(data[phase] as Match[]).map(match => (
                <MatchCard key={match.id} match={match} groupId={groupId} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
