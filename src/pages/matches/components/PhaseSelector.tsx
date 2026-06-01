import { cn } from '@/lib/utils'

type Phase = 'group' | 'knockout'

interface PhaseSelectorProps {
  value: Phase
  onChange: (phase: Phase) => void
}

export function PhaseSelector({ value, onChange }: PhaseSelectorProps) {
  return (
    <div className="w-full overflow-x-auto pb-1 sm:w-auto">
      <div
        className="flex min-w-max rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] p-1"
        role="tablist"
        aria-label="Selecionar fase"
      >
        {(['group', 'knockout'] as Phase[]).map(phase => (
          <button
            key={phase}
            role="tab"
            aria-selected={value === phase}
            onClick={() => onChange(phase)}
            className={cn(
              'flex min-h-10 min-w-32 flex-1 items-center justify-center gap-2 rounded-[var(--radius-pill)] px-4 text-sm font-semibold transition duration-150 focus:outline focus:outline-2 focus:outline-offset-[3px] focus:outline-[var(--brand)] sm:min-w-36',
              value === phase
                ? 'bg-[var(--brand)] text-[var(--brand-text)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]',
            )}
          >
            <span>{phase === 'group' ? 'Fase de Grupos' : 'Mata-mata'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
