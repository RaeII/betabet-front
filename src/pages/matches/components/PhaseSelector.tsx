import { cn } from '@/lib/utils'

type Phase = 'group' | 'knockout'

interface PhaseSelectorProps {
  value: Phase
  onChange: (phase: Phase) => void
}

export function PhaseSelector({ value, onChange }: PhaseSelectorProps) {
  return (
    <div className="flex rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-soft)] p-1" role="tablist">
      {(['group', 'knockout'] as Phase[]).map(phase => (
        <button
          key={phase}
          role="tab"
          aria-selected={value === phase}
          onClick={() => onChange(phase)}
          className={cn(
            'flex-1 rounded-[calc(var(--radius)-2px)] px-4 py-2 text-sm font-medium transition-colors',
            value === phase
              ? 'bg-[var(--surface)] text-[var(--brand)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text)]',
          )}
        >
          {phase === 'group' ? 'Fase de Grupos' : 'Mata-mata'}
        </button>
      ))}
    </div>
  )
}
