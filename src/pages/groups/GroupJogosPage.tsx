import { useEffect, useRef, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { PhaseSelector } from '@/pages/matches/components/PhaseSelector'
import { KnockoutBracket } from '@/pages/matches/components/KnockoutBracket'
import { WorldCupGroupOverview } from '@/pages/matches/components/WorldCupGroupOverview'
import { useMatchesByPhase } from '@/hooks/useMatches'

type Phase = 'group' | 'knockout'

export function GroupJogosPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const location = useLocation()
  // Fase vinda da navegação: ao voltar do detalhe da partida (restaura a fase)
  // ou pelo atalho "Mata-mata" do menu (abre direto a chave eliminatória).
  // `bracketView` volta junto quando o jogo veio do mata-mata — restaura a
  // posição (scale/tx/ty) exata da árvore.
  const navState = location.state as {
    phase?: Phase
    bracketView?: { scale: number; tx: number; ty: number }
  } | null
  const navigatedPhase = navState?.phase
  const [phase, setPhase] = useState<Phase>(() => navigatedPhase ?? 'group')
  // A cada navegação para a página, a fase segue o destino: "Mata-mata" e o
  // "Voltar" do detalhe trazem `state.phase`; "Jogos" (sem state) cai no grupo.
  // Seleção manual no PhaseSelector não muda `location.key`, então é preservada.
  useEffect(() => {
    setPhase(navigatedPhase ?? 'group')
  }, [location.key, navigatedPhase])
  const { data, isLoading, isError } = useMatchesByPhase()

  // Atalho "Mata-mata": ao chegar pelo menu, centraliza o chaveamento na tela
  // (em vez de parar no topo da página). Roda uma vez por navegação, depois
  // que os dados carregaram e a seção existe no DOM.
  const knockoutRef = useRef<HTMLDivElement>(null)
  const scrolledKeyRef = useRef<string | null>(null)
  useEffect(() => {
    if (navigatedPhase !== 'knockout' || phase !== 'knockout' || !data) return
    if (scrolledKeyRef.current === location.key) return
    const el = knockoutRef.current
    if (!el) return
    scrolledKeyRef.current = location.key
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [location.key, navigatedPhase, phase, data])
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
          restoreView={navState?.bracketView ?? null}
          focusRef={knockoutRef}
        />
      )}
    </div>
  )
}
