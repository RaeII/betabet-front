import type { MatchdayGroup } from '@/types/match.types'

interface DayStripPillProps {
  matchday: MatchdayGroup
  selected: boolean
  onSelect: () => void
}

export function DayStripPill({ matchday, selected, onSelect }: DayStripPillProps) {
  const date = new Date(`${matchday.date}T12:00:00`)
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace(/\.$/, '')
  const day = String(date.getDate())
  const month = date.toLocaleDateString('pt-BR', { month: 'short' }).replace(/\.$/, '')

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Selecionar dia ${matchday.label}`}
      className={[
        'relative flex w-[52px] flex-col items-center gap-0.5 rounded-[var(--radius-md)] border px-1.5 py-2.5 transition-all duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--support)]',
        selected
          ? 'border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-text)]'
          : matchday.isPast
            ? 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)] hover:text-[var(--text)]'
            : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--brand)]',
      ].join(' ')}
    >
      {matchday.isToday && (
        <span
          aria-hidden="true"
          className={[
            'absolute right-1.5 top-1.5 h-1 w-1 rounded-full',
            selected ? 'bg-[var(--brand-text)] opacity-50' : 'bg-[var(--support)]',
          ].join(' ')}
        />
      )}

      <span
        className={[
          'text-[9px] font-semibold uppercase tracking-[0.08em]',
          selected ? 'opacity-70' : 'text-[var(--text-muted)]',
        ].join(' ')}
      >
        {weekday.slice(0, 3)}
      </span>

      <span className="text-[17px] font-bold leading-none">{day}</span>

      <span
        className={[
          'text-[9px] font-semibold uppercase tracking-[0.06em]',
          selected
            ? 'opacity-70'
            : matchday.isToday
              ? 'text-[var(--support)]'
              : 'text-[var(--text-muted)]',
        ].join(' ')}
      >
        {matchday.isToday ? 'hoje' : month}
      </span>
    </button>
  )
}
