import type { PreviewProbability } from '@/services/matchPreview.service'

interface PreMatchProbabilityProps {
  prediction: PreviewProbability
  homeName: string
  awayName: string
}

interface BarProps {
  label: string
  value: number
  highlight: boolean
}

function ProbabilityBar({ label, value, highlight }: BarProps) {
  const width = Math.max(0, Math.min(100, value))
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-3 text-xs font-semibold">
        <span className="truncate text-[var(--text)]">{label}</span>
        <span className="tabular-nums text-[var(--text-muted)]">{value.toFixed(0)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-soft)]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            highlight ? 'bg-[var(--brand)]' : 'bg-[var(--text-muted)]/45'
          }`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

export function PreMatchProbability({ prediction, homeName, awayName }: PreMatchProbabilityProps) {
  const { home, draw, away } = prediction.percent
  const top = Math.max(home, draw, away)

  return (
    <section className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Probabilidade
          </p>
        </div>
      </header>

      <div className="space-y-2.5">
        <ProbabilityBar label={homeName} value={home} highlight={home === top && home > 0} />
        <ProbabilityBar label="Empate" value={draw} highlight={draw === top && draw > 0} />
        <ProbabilityBar label={awayName} value={away} highlight={away === top && away > 0} />
      </div>
    </section>
  )
}
