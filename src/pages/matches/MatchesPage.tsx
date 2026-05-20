import { useState } from 'react'
import { PhaseSelector } from './components/PhaseSelector'
import { GroupStageGrid } from './components/GroupStageGrid'
import { KnockoutBracket } from './components/KnockoutBracket'
import { useMatchesByPhase } from '@/hooks/useMatches'

type Phase = 'group' | 'knockout'

export function MatchesPage() {
  const [phase, setPhase] = useState<Phase>('group')
  const { data, isLoading, isError } = useMatchesByPhase()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text)]">Partidas</h1>

      <PhaseSelector value={phase} onChange={setPhase} />

      {isLoading && (
        <div className="flex h-48 items-center justify-center text-[var(--text-muted)]">
          Carregando partidas…
        </div>
      )}

      {isError && (
        <div className="flex h-48 items-center justify-center text-[var(--danger)]">
          Erro ao carregar partidas.
        </div>
      )}

      {data && phase === 'group' && <GroupStageGrid data={data.groupStage} />}
      {data && phase === 'knockout' && <KnockoutBracket data={data.knockout} />}
    </div>
  )
}
