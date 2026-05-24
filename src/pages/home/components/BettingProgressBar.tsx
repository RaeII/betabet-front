import { CheckCircle2 } from 'lucide-react'
import type { BettingProgress } from '@/types/match.types'

interface BettingProgressBarProps {
  progress: BettingProgress
  greeting?: string
}

export function BettingProgressBar({ progress, greeting }: BettingProgressBarProps) {
  if (progress.total === 0) return null

  return (
    <section
      aria-label="Progresso de palpites"
      className="space-y-2 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="truncate text-sm font-semibold text-[var(--text)]">
          {greeting ?? 'Seus palpites'}
        </p>
        <p className="shrink-0 text-xs font-semibold text-[var(--text-muted)]">
          {progress.betted} de {progress.total} palpites
        </p>
      </div>

      <div
        role="progressbar"
        aria-valuenow={progress.pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 overflow-hidden rounded-full bg-[var(--surface-soft)]"
      >
        <div
          className="h-full rounded-full bg-[var(--brand)] transition-[width] duration-300"
          style={{ width: `${progress.pct}%` }}
        />
      </div>

      {progress.isComplete ? (
        <p className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--success)]">
          <CheckCircle2 size={12} />
          Todos os palpites do dia estão prontos!
        </p>
      ) : null}
    </section>
  )
}
