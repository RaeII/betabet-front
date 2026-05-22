import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScoringExample } from '@/components/scoring/ScoringExample'

interface ScoringConfigStepProps {
  resultPoints: number
  exactScorePoints: number
  onResultPointsChange: (value: number) => void
  onExactScorePointsChange: (value: number) => void
  onBack: () => void
  onSubmit: () => void
  isPending: boolean
  isError: boolean
}

export function ScoringConfigStep({
  resultPoints,
  exactScorePoints,
  onResultPointsChange,
  onExactScorePointsChange,
  onBack,
  onSubmit,
  isPending,
  isError,
}: ScoringConfigStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-[var(--text)]">Quanto vale cada aposta?</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Configure os pontos e veja o impacto no exemplo abaixo.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Input
            label="Acertar o vencedor"
            type="number"
            min={1}
            max={10}
            value={resultPoints}
            onChange={(e) => onResultPointsChange(Math.max(1, Math.min(10, Number(e.target.value))))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Input
            label="Acertar o placar"
            type="number"
            min={1}
            max={20}
            value={exactScorePoints}
            onChange={(e) => onExactScorePointsChange(Math.max(1, Math.min(20, Number(e.target.value))))}
          />
        </div>
      </div>

      <ScoringExample resultPoints={resultPoints} exactScorePoints={exactScorePoints} />

      {isError && (
        <p className="text-sm text-[var(--danger)]">Erro ao criar grupo. Tente novamente.</p>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onBack} className="flex-1">
          <ArrowLeft size={16} className="mr-1" />
          Voltar
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isPending}
          className="flex-1"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : 'Criar grupo'}
        </Button>
      </div>
    </div>
  )
}
