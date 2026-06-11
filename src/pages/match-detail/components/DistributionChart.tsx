import { Users } from 'lucide-react'
import { formatPct } from '@/lib/format.utils'
import type { DistributionData } from '@/types/match.types'

interface DistributionChartProps {
  data: DistributionData
  homeTeamName: string
  awayTeamName: string
}

interface OutcomeProps {
  label: string
  pct: number
  color: string
}

function OutcomeStat({ label, pct, color }: OutcomeProps) {
  return (
    <div className="min-w-0 px-2.5 first:pl-0 last:pr-0 sm:px-3">
      <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        <span className="truncate">{label}</span>
      </dt>
      <dd className="mt-1 text-base font-bold tabular-nums text-[var(--text)] sm:text-lg">
        {formatPct(pct)}
      </dd>
    </div>
  )
}

export function DistributionChart({ data, homeTeamName, awayTeamName }: DistributionChartProps) {
  const outcomes = [
    { label: homeTeamName, pct: data.homePct, color: 'var(--brand)' },
    { label: 'Empate', pct: data.drawPct, color: 'var(--text-muted)' },
    { label: awayTeamName, pct: data.awayPct, color: 'var(--support)' },
  ]
  const totalLabel = data.totalBets === 1 ? '1 palpite' : `${data.totalBets} palpites`

  return (
    <section className="space-y-4 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--brand)]/20 bg-[color-mix(in_srgb,var(--brand)_6%,var(--surface))] p-4 sm:p-5">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-[var(--brand-text)]">
            <Users aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[var(--text)]">Palpite da galera</h3>
            <p className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">{totalLabel}</p>
          </div>
        </div>
      </header>

      <p className="text-xs leading-relaxed text-[var(--text-muted)]">
        Mostra como a galera dividiu seus palpites entre vitória do mandante,
        empate e vitória do visitante.
      </p>

      <dl className="grid grid-cols-3 divide-x divide-[var(--border)]">
        {outcomes.map((outcome) => (
          <OutcomeStat
            key={outcome.label}
            label={outcome.label}
            pct={outcome.pct}
            color={outcome.color}
          />
        ))}
      </dl>
    </section>
  )
}
