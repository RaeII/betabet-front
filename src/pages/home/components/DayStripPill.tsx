import type { MatchdayGroup } from '@/types/match.types'

interface DayStripPillProps {
  matchday: MatchdayGroup
  selected: boolean
  onSelect: () => void
}

export function DayStripPill({ matchday, selected, onSelect }: DayStripPillProps) {
  const [weekday, dayMonth] = matchday.label.split(',').map(s => s.trim())

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Selecionar dia ${matchday.label}`}
      className={[
        'flex min-w-[68px] flex-col items-center gap-0.5 rounded-[var(--radius-pill)] border px-3 py-2 text-xs font-semibold transition',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--support)]',
        selected
          ? 'border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-text)] shadow-sm'
          : matchday.isPast
            ? 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)] hover:text-[var(--text)]'
            : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--brand)]',
      ].join(' ')}
    >
      <span className="text-[10px] uppercase tracking-[0.12em]">{weekday}</span>
      <span className="text-sm">{dayMonth}</span>
      {matchday.isToday ? (
        <span className="text-[9px] uppercase tracking-[0.18em] opacity-80">Hoje</span>
      ) : null}
    </button>
  )
}
