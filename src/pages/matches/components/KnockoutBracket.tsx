import { Link } from 'react-router-dom'
import { MatchStatusBadge } from '@/components/match/MatchStatusBadge'
import { formatScore } from '@/lib/format.utils'
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
}

function MatchSlot({ match }: { match: Match }) {
  return (
    <Link
      to={`/matches/${match.id}`}
      className="flex flex-col gap-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-3 text-sm transition hover:border-[var(--brand)]/30"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-medium text-[var(--text)]">{match.homeTeam.name}</span>
        <span className="shrink-0 font-bold text-[var(--text)]">
          {formatScore(match.homeScore, match.awayScore)}
        </span>
        <span className="truncate text-right font-medium text-[var(--text)]">{match.awayTeam.name}</span>
      </div>
      <div className="flex justify-center">
        <MatchStatusBadge status={match.status} />
      </div>
    </Link>
  )
}

export function KnockoutBracket({ data }: KnockoutBracketProps) {
  const phases = PHASE_ORDER.filter(p => data[p]?.length > 0)

  if (phases.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-[var(--text-muted)]">
        Mata-mata ainda não iniciado.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-6 pb-4">
        {phases.map(phase => (
          <div key={phase} className="flex w-52 flex-col gap-3">
            <h3 className="text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {PHASE_LABELS[phase] ?? phase}
            </h3>
            <div className="flex flex-col gap-2">
              {(data[phase] as Match[]).map(match => (
                <MatchSlot key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
