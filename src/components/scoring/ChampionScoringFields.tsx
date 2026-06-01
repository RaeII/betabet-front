import { Crown } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface ChampionScoringFieldsProps {
  enabled: boolean
  firstPoints: number
  secondPoints: number
  onEnabledChange: (value: boolean) => void
  onFirstPointsChange: (value: number) => void
  onSecondPointsChange: (value: number) => void
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  return Math.max(min, Math.min(max, value))
}

/**
 * Configuração da modalidade "campeão da Copa": liga/desliga + pontos do 1º e 2º
 * palpite. Garante 2º palpite <= 1º palpite no próprio input (o backend revalida).
 */
export function ChampionScoringFields({
  enabled,
  firstPoints,
  secondPoints,
  onEnabledChange,
  onFirstPointsChange,
  onSecondPointsChange,
}: ChampionScoringFieldsProps) {
  function handleFirstChange(raw: number) {
    const next = clamp(raw, 1, 100)
    onFirstPointsChange(next)
    if (secondPoints > next) onSecondPointsChange(next)
  }

  return (
    <div className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Crown size={18} className="mt-0.5 shrink-0 text-[var(--brand)]" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text)]">Aposta de campeão</p>
            <p className="text-xs text-[var(--text-muted)]">
              Cada membro escolhe dois times para vencer a Copa.
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Ativar aposta de campeão"
          onClick={() => onEnabledChange(!enabled)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--support)] ${
            enabled ? 'bg-[var(--brand)]' : 'border border-[var(--border)] bg-[var(--surface-soft)]'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
              enabled ? 'translate-x-[1.375rem]' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {enabled && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Acertar o 1º palpite"
              type="number"
              min={1}
              max={100}
              value={firstPoints}
              onChange={e => handleFirstChange(Number(e.target.value))}
            />
            <Input
              label="Acertar o 2º palpite"
              type="number"
              min={0}
              max={firstPoints}
              value={secondPoints}
              onChange={e => onSecondPointsChange(clamp(Number(e.target.value), 0, firstPoints))}
            />
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Só o campeão pontua: {firstPoints} pts no 1º palpite ou {secondPoints} pts no 2º.
          </p>
        </>
      )}
    </div>
  )
}
