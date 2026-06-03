import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Stepper } from '@/components/ui/stepper'
import { ScoringExample } from '@/components/scoring/ScoringExample'
import { ChampionScoringFields } from '@/components/scoring/ChampionScoringFields'

interface ScoringConfigStepProps {
  resultPoints: number
  exactScorePoints: number
  championBetEnabled: boolean
  championFirstPoints: number
  championSecondPoints: number
  onResultPointsChange: (value: number) => void
  onExactScorePointsChange: (value: number) => void
  onChampionBetEnabledChange: (value: boolean) => void
  onChampionFirstPointsChange: (value: number) => void
  onChampionSecondPointsChange: (value: number) => void
  onBack: () => void
  onSubmit: () => void
  isPending: boolean
  isError: boolean
}

export function ScoringConfigStep({
  resultPoints,
  exactScorePoints,
  championBetEnabled,
  championFirstPoints,
  championSecondPoints,
  onResultPointsChange,
  onExactScorePointsChange,
  onChampionBetEnabledChange,
  onChampionFirstPointsChange,
  onChampionSecondPointsChange,
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
        <Stepper
          label="Acertar o vencedor"
          min={1}
          max={25}
          value={resultPoints}
          onChange={onResultPointsChange}
        />
        <Stepper
          label="Acertar o placar"
          min={1}
          max={25}
          value={exactScorePoints}
          onChange={onExactScorePointsChange}
        />
      </div>

      <ScoringExample resultPoints={resultPoints} exactScorePoints={exactScorePoints} />

      <ChampionScoringFields
        enabled={championBetEnabled}
        firstPoints={championFirstPoints}
        secondPoints={championSecondPoints}
        onEnabledChange={onChampionBetEnabledChange}
        onFirstPointsChange={onChampionFirstPointsChange}
        onSecondPointsChange={onChampionSecondPointsChange}
      />

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
          {isPending ? <Loader2 size={16} className="animate-spin" /> : 'Criar bolão'}
        </Button>
      </div>
    </div>
  )
}
