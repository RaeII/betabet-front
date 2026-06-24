import { useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { PhaseSelector } from '@/pages/matches/components/PhaseSelector'
import { KnockoutBracket } from '@/pages/matches/components/KnockoutBracket'
import { WorldCupGroupOverview } from '@/pages/matches/components/WorldCupGroupOverview'
import { useMatchesByPhase } from '@/hooks/useMatches'

type Phase = 'group' | 'knockout'

export function GroupJogosPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const location = useLocation()
  // Ao voltar do detalhe da partida, restaura a fase que estava selecionada.
  const [phase, setPhase] = useState<Phase>(
    () => (location.state as { phase?: Phase } | null)?.phase ?? 'group',
  )
  const { data, isLoading, isError } = useMatchesByPhase()
  // Anexado ao link do card; o detalhe usa para o botão "Voltar".
  const backState = { fromJogos: phase }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Calendário
          </p>
          <h1 className="text-2xl font-bold text-[var(--text)]">Jogos</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Acompanhe jogos, grupos e classificação da Copa.
          </p>
        </div>

        <PhaseSelector value={phase} onChange={setPhase} />
      </section>

      {isLoading && (
        <div className="flex h-48 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text-muted)]">
          Carregando partidas…
        </div>
      )}

      {isError && (
        <div className="flex h-48 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--danger)]">
          Erro ao carregar partidas.
        </div>
      )}

      {data && phase === 'group' && (
        <WorldCupGroupOverview data={data.groupStage} groupId={groupId} backState={backState} />
      )}
      {data && phase === 'knockout' && (
        <KnockoutBracket
          data={data.knockout}
          groupStage={data.groupStage}
          groupId={groupId}
          backState={backState}
        />
      )}
    </div>
  )
}
