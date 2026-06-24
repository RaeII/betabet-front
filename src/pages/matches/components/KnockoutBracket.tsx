import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { MoveHorizontal, Trophy } from 'lucide-react'
import { MatchCard } from '@/components/match/MatchCard'
import { TeamFlagImage } from '@/components/match/TeamFlagImage'
import { useWorldCupStandings } from '@/hooks/useWorldCupStandings'
import type { Match, MatchesResponse } from '@/types/match.types'
import {
  BRACKET,
  BRACKET_RENDER_ORDER,
  PHASE_LABELS,
  type BracketMatch,
  type BracketPhase,
} from './knockoutBracket.config'
import {
  buildStandingsIndex,
  buildTeamAssetsFromGroupStage,
  hasApiKnockout,
  resolveSlot,
  type SlotView,
  type StandingsIndex,
} from './knockoutBracket.utils'
import type { GroupTeamAsset } from './worldCupGroup.utils'

interface KnockoutBracketProps {
  data: MatchesResponse['knockout']
  groupStage: MatchesResponse['groupStage']
  groupId?: string
  backState?: Record<string, unknown>
}

// Largura fixa de cada coluna (fase). No mobile a soma ultrapassa a tela,
// habilitando o scroll horizontal — o usuário arrasta para o lado.
const COLUMN_WIDTH = 'w-[13.5rem] sm:w-[15rem]'

export function KnockoutBracket({ data, groupStage, groupId, backState }: KnockoutBracketProps) {
  // Quando a FIFA define o chaveamento, a API entrega os confrontos reais.
  if (hasApiKnockout(data)) {
    return <ApiKnockout data={data} groupId={groupId} backState={backState} />
  }
  return <ProjectedBracket groupStage={groupStage} />
}

// ─── Confrontos reais (API) ──────────────────────────────────────────
const API_PHASE_ORDER: BracketPhase[] = ['r32', 'r16', 'qf', 'sf', 'final']

function ApiKnockout({
  data,
  groupId,
  backState,
}: Pick<KnockoutBracketProps, 'data' | 'groupId' | 'backState'>) {
  const phases = API_PHASE_ORDER.filter(p => data[p]?.length > 0)

  return (
    <div className="space-y-8">
      {phases.map(phase => (
        <section key={phase} className="mx-auto w-full max-w-[42rem] space-y-3">
          <PhaseDivider label={PHASE_LABELS[phase]} />
          <div className="space-y-3">
            {(data[phase] as Match[]).map(match => (
              <MatchCard key={match.id} match={match} groupId={groupId} backState={backState} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

// ─── Chaveamento projetado pela classificação ────────────────────────

interface BracketConnectors {
  width: number
  height: number
  paths: string[]
}

// Arestas vencedor→próximo jogo, derivadas dos slots `matchWinner` do config.
// Cada aresta vira uma linha de conexão (cotovelo) no chaveamento.
const BRACKET_EDGES: { from: number; to: number }[] = BRACKET.flatMap(m =>
  [m.home, m.away]
    .filter((slot): slot is Extract<typeof slot, { kind: 'matchWinner' }> => slot.kind === 'matchWinner')
    .map(slot => ({ from: slot.match, to: m.no })),
)

// Ordem vertical de cada coluna seguindo a árvore do chaveamento: DFS a partir
// da final, filho `home` antes do `away`. Na ordem do config os alimentadores
// vêm intercalados (ex.: jogo 89 ← 74 e 77, com 73/75 no meio), então as linhas
// se cruzam e parecem ligar um jogo a mais de um. A árvore mantém cada par de
// alimentadores adjacente, fechando o cotovelo sem cruzamentos.
const BRACKET_VERTICAL_ORDER: Map<number, number> = (() => {
  const children = new Map<number, number[]>()
  for (const edge of BRACKET_EDGES) {
    const list = children.get(edge.to) ?? []
    list.push(edge.from)
    children.set(edge.to, list)
  }
  const order = new Map<number, number>()
  let next = 0
  const visit = (no: number) => {
    order.set(no, next++)
    for (const child of children.get(no) ?? []) visit(child)
  }
  const finalMatch = BRACKET.find(m => m.phase === 'final')
  if (finalMatch) visit(finalMatch.no)
  return order
})()

function ProjectedBracket({ groupStage }: { groupStage: MatchesResponse['groupStage'] }) {
  const standingsQuery = useWorldCupStandings()

  const index = useMemo<StandingsIndex>(
    () => buildStandingsIndex(standingsQuery.data),
    [standingsQuery.data],
  )
  const teamAssets = useMemo(() => buildTeamAssetsFromGroupStage(groupStage), [groupStage])

  const innerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef(new Map<number, HTMLElement>())
  const [connectors, setConnectors] = useState<BracketConnectors>({ width: 0, height: 0, paths: [] })

  // Mede as posições reais dos cards (em coordenadas do conteúdo rolável) e
  // desenha um cotovelo H→V→H ligando cada jogo ao seu confronto seguinte.
  // Medir contra o próprio container `w-max` torna o cálculo imune ao scroll.
  useLayoutEffect(() => {
    const inner = innerRef.current
    if (!inner) return

    const measure = () => {
      const base = inner.getBoundingClientRect()
      const box = (no: number) => {
        const el = cardRefs.current.get(no)
        if (!el) return null
        const r = el.getBoundingClientRect()
        return { left: r.left - base.left, right: r.right - base.left, midY: r.top - base.top + r.height / 2 }
      }

      const paths: string[] = []
      for (const { from, to } of BRACKET_EDGES) {
        const a = box(from)
        const b = box(to)
        if (!a || !b) continue
        // Alimentador à esquerda sai pela direita; à direita, pela esquerda.
        const feedRight = a.left < b.left
        const x1 = feedRight ? a.right : a.left
        const x2 = feedRight ? b.left : b.right
        const midX = (x1 + x2) / 2
        paths.push(`M ${x1} ${a.midY} H ${midX} V ${b.midY} H ${x2}`)
      }
      setConnectors({ width: inner.offsetWidth, height: inner.offsetHeight, paths })
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(inner)
    return () => ro.disconnect()
  }, [index, teamAssets])

  return (
    <div className="space-y-4">
      <p className="mx-auto max-w-[34rem] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-center text-xs leading-relaxed text-[var(--text-muted)]">
        Confrontos <strong className="font-semibold text-[var(--text)]">projetados</strong> pela
        classificação atual — atualizam conforme os jogos. Os melhores 3ºs e o chaveamento oficial
        são confirmados pela FIFA ao fim da fase de grupos.
      </p>

      {/* Dica de navegação: o chaveamento é mais largo que a tela no celular. */}
      <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--text-muted)] xl:hidden">
        <MoveHorizontal size={14} aria-hidden="true" />
        Arraste para o lado para ver todas as fases
      </p>

      {/*
        Chaveamento horizontal: cada fase é uma coluna lado a lado, do 16-avos
        (pontas) até a final (centro), espelhando a imagem oficial. As colunas
        têm a mesma altura e usam justify-around, então cada jogo se alinha no
        ponto médio entre seus dois alimentadores (8→4→2→1→1→1→2→4→8) — o efeito
        de funil/ampulheta clássico. No celular o scroll horizontal entra em ação.
      */}
      <div className="overflow-x-auto pb-3 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
        <div ref={innerRef} className="relative mx-auto flex w-max items-stretch gap-2.5 sm:gap-3.5">
          {/* Linhas de conexão entre os jogos (atrás dos cards). */}
          <svg
            className="pointer-events-none absolute inset-0 z-0"
            width={connectors.width || undefined}
            height={connectors.height || undefined}
            aria-hidden="true"
          >
            {connectors.paths.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="var(--border)" strokeWidth={1.5} />
            ))}
          </svg>

          {BRACKET_RENDER_ORDER.map(({ phase, half }) => {
            const matches = BRACKET.filter(m => m.phase === phase && m.half === half).sort(
              (a, b) => (BRACKET_VERTICAL_ORDER.get(a.no) ?? 0) - (BRACKET_VERTICAL_ORDER.get(b.no) ?? 0),
            )
            if (matches.length === 0) return null

            return (
              <div
                key={`${phase}-${half}`}
                className={`relative z-10 flex shrink-0 flex-col gap-2 ${COLUMN_WIDTH}`}
              >
                <PhaseDivider label={PHASE_LABELS[phase]} />
                <div className="flex flex-1 flex-col justify-around gap-2">
                  {matches.map(match => (
                    <ProjectedMatchCard
                      key={match.no}
                      match={match}
                      index={index}
                      teamAssets={teamAssets}
                      isFinal={phase === 'final'}
                      registerRef={el => {
                        if (el) cardRefs.current.set(match.no, el)
                        else cardRefs.current.delete(match.no)
                      }}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ProjectedMatchCard({
  match,
  index,
  teamAssets,
  isFinal,
  registerRef,
}: {
  match: BracketMatch
  index: StandingsIndex
  teamAssets: Map<string, GroupTeamAsset>
  isFinal: boolean
  /** Registra o nó DOM do card para o cálculo das linhas de conexão. */
  registerRef?: (el: HTMLDivElement | null) => void
}) {
  const home = resolveSlot(match.home, index, teamAssets)
  const away = resolveSlot(match.away, index, teamAssets)

  return (
    <div
      ref={registerRef}
      className={`rounded-[var(--radius-lg)] border bg-[var(--surface)] p-3 ${
        isFinal
          ? 'border-[var(--support)] shadow-[0_0_0_1px_var(--support)]'
          : 'border-[var(--border)]'
      }`}
    >
      <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        <span>Jogo {match.no}</span>
        {isFinal && (
          <span className="inline-flex items-center gap-1 text-[var(--support)]">
            <Trophy size={12} aria-hidden="true" /> Taça
          </span>
        )}
      </div>
      <SlotRow view={home} />
      <div className="my-1 h-px bg-[var(--border)]" />
      <SlotRow view={away} />
    </div>
  )
}

function SlotRow({ view }: { view: SlotView }) {
  if (view.type === 'team') {
    return (
      <div className="flex min-w-0 items-center gap-2 py-0.5">
        <TeamFlagImage
          src={view.team.flagUrl}
          teamId={view.team.teamId}
          alt=""
          className="h-5 w-7 shrink-0 rounded-[var(--radius-sm)] object-contain"
        />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--text)]">
          {view.team.name}
        </span>
        <span className="shrink-0 text-[10px] font-medium tabular-nums text-[var(--text-muted)]">
          {view.seed}
        </span>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 items-center gap-2 py-0.5">
      <span className="flex h-5 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--surface-soft)] text-[10px] font-bold text-[var(--text-muted)]">
        ?
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--text-muted)]">
        {view.primary}
      </span>
      {view.secondary && (
        <span className="shrink-0 text-[10px] font-medium text-[var(--text-muted)]">
          {view.secondary}
        </span>
      )}
    </div>
  )
}

function PhaseDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-[var(--border)]" />
      <h3 className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
        {label}
      </h3>
      <span className="h-px flex-1 bg-[var(--border)]" />
    </div>
  )
}
