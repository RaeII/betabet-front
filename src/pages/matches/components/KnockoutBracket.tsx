import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type Ref,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Hand, Maximize, Trophy, ZoomIn, ZoomOut } from 'lucide-react'
import { TeamFlagImage } from '@/components/match/TeamFlagImage'
import { Button } from '@/components/ui/button'
import { useWorldCupStandings } from '@/hooks/useWorldCupStandings'
import { useZoomPan } from '@/hooks/useZoomPan'
import type { Match, MatchesResponse } from '@/types/match.types'
import {
  BRACKET,
  BRACKET_RENDER_ORDER,
  formatBracketKickoff,
  MATCH_KICKOFF_UTC,
  PHASE_LABELS,
  type BracketMatch,
} from './knockoutBracket.config'
import {
  buildStandingsIndex,
  buildTeamAssetsFromGroupStage,
  resolveSlot,
  type SlotView,
  type StandingsIndex,
} from './knockoutBracket.utils'
import type { GroupTeamAsset } from './worldCupGroup.utils'

/** Vista de zoom/pan do chaveamento; persiste ao abrir o detalhe de um jogo. */
type BracketView = { scale: number; tx: number; ty: number }

interface KnockoutBracketProps {
  data: MatchesResponse['knockout']
  groupStage: MatchesResponse['groupStage']
  groupId?: string
  backState?: Record<string, unknown>
  /** Vista salva ao sair para o detalhe; restaura a posição exata ao voltar. */
  restoreView?: BracketView | null
  /** Aponta para a visualização dos jogos; usado para centralizar o scroll. */
  focusRef?: Ref<HTMLDivElement>
}

// Largura fixa de cada coluna (fase). No mobile a soma ultrapassa a tela,
// habilitando o scroll horizontal — o usuário arrasta para o lado.
const COLUMN_WIDTH = 'w-[13.5rem] sm:w-[15rem]'

export function KnockoutBracket({
  data,
  groupStage,
  groupId,
  backState,
  restoreView,
  focusRef,
}: KnockoutBracketProps) {
  // Visualização única: o chaveamento em árvore. Cada slot é preenchido pelo
  // confronto REAL já cadastrado no banco (vindo da API-Football, mapeado pelo
  // horário oficial do jogo); enquanto a FIFA não define um confronto, o slot
  // cai na projeção pela classificação atual.
  return (
    <ProjectedBracket
      data={data}
      groupStage={groupStage}
      groupId={groupId}
      backState={backState}
      restoreView={restoreView}
      focusRef={focusRef}
    />
  )
}

// ─── Slot real (banco) × slot projetado ──────────────────────────────

/** Converte uma seleção da partida cadastrada no banco no `SlotView` de time,
 *  reaproveitando a mesma renderização dos slots projetados. */
function teamSlotFromMatch(team: Match['homeTeam']): SlotView {
  return {
    type: 'team',
    team: { name: team.name, flagUrl: team.flagUrl, teamId: team.apiTeamId ?? team.id },
    seed: '',
  }
}

/**
 * Indexa os confrontos reais do mata-mata (todas as fases de `knockout`) pelo
 * NÚMERO oficial do jogo (73–104). O casamento usa o horário de início: o
 * calendário FIFA fixa data/hora por número de jogo, e a API-Football usa o
 * mesmo calendário — então `scheduledAt` da partida bate exatamente com
 * `MATCH_KICKOFF_UTC[no]`. Assim que o admin importa a partida, ela substitui o
 * slot projetado correspondente. Sem casamento (horário ainda não catalogado),
 * o slot permanece projetado.
 */
function buildRealMatchByNo(knockout: MatchesResponse['knockout']): Map<number, Match> {
  const noByKickoff = new Map<number, number>()
  for (const [no, iso] of Object.entries(MATCH_KICKOFF_UTC)) {
    noByKickoff.set(new Date(iso).getTime(), Number(no))
  }
  const byNo = new Map<number, Match>()
  for (const match of Object.values(knockout).flat()) {
    const no = noByKickoff.get(new Date(match.scheduledAt).getTime())
    if (no != null) byNo.set(no, match)
  }
  return byNo
}

// ─── Chaveamento (árvore) ─────────────────────────────────────────────

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

function ProjectedBracket({
  data,
  groupStage,
  groupId,
  backState,
  restoreView,
  focusRef,
}: {
  data: MatchesResponse['knockout']
  groupStage: MatchesResponse['groupStage']
  groupId?: string
  backState?: Record<string, unknown>
  restoreView?: BracketView | null
  focusRef?: Ref<HTMLDivElement>
}) {
  const standingsQuery = useWorldCupStandings()
  const navigate = useNavigate()

  const index = useMemo<StandingsIndex>(
    () => buildStandingsIndex(standingsQuery.data),
    [standingsQuery.data],
  )
  const teamAssets = useMemo(() => buildTeamAssetsFromGroupStage(groupStage), [groupStage])
  // Confrontos reais do banco, por número de jogo — têm prioridade sobre a
  // projeção em cada slot da árvore.
  const realByNo = useMemo(() => buildRealMatchByNo(data), [data])

  // getView vem do hook (declarado abaixo); ref quebra a dependência circular
  // openMatch → getView → useZoomPan → onTap → openMatch.
  const getViewRef = useRef<() => BracketView>(() => ({ scale: 1, tx: 0, ty: 0 }))

  // Abre o detalhe da partida real, salvando a vista atual do chaveamento para
  // o botão "Voltar" do detalhe restaurar a mesma posição (scale/tx/ty).
  const openMatch = useCallback(
    (match: Match) => {
      const href = groupId ? `/groups/${groupId}/matches/${match.id}` : `/matches/${match.id}`
      navigate(href, { state: { ...backState, fromJogos: 'knockout', bracketView: getViewRef.current() } })
    },
    [navigate, groupId, backState],
  )

  // Toque limpo no viewport → descobre o card sob o ponto (o click chega no
  // viewport por causa do pointer capture do gesto) e abre o confronto real.
  const onTap = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      const cardEl = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-match-no]')
      if (!cardEl) return
      const real = realByNo.get(Number(cardEl.getAttribute('data-match-no')))
      if (real) openMatch(real)
    },
    [realByNo, openMatch],
  )

  const {
    transformStyle,
    viewportRef,
    contentRef,
    handlers,
    zoomIn,
    zoomOut,
    reset,
    getView,
    pageLeft,
    pageRight,
    canPanLeft,
    canPanRight,
  } = useZoomPan({ restoreView, onTap })
  getViewRef.current = getView
  const cardRefs = useRef(new Map<number, HTMLElement>())
  const [connectors, setConnectors] = useState<BracketConnectors>({ width: 0, height: 0, paths: [] })

  // Mede as posições reais dos cards e desenha um cotovelo H→V→H ligando cada
  // jogo ao seu confronto seguinte. Medir contra o próprio container `w-max`
  // torna o cálculo imune a scroll e translate. Como o conteúdo pode estar sob
  // um `transform: scale()`, `getBoundingClientRect()` vem escalado mas
  // `offsetWidth` não — então dividimos as diferenças pela escala viva
  // (`base.width / offsetWidth`) para voltar ao espaço de layout do SVG.
  useLayoutEffect(() => {
    const inner = contentRef.current
    if (!inner) return

    const measure = () => {
      const base = inner.getBoundingClientRect()
      const s = inner.offsetWidth ? base.width / inner.offsetWidth : 1
      const box = (no: number) => {
        const el = cardRefs.current.get(no)
        if (!el) return null
        const r = el.getBoundingClientRect()
        return {
          left: (r.left - base.left) / s,
          right: (r.right - base.left) / s,
          midY: (r.top - base.top) / s + r.height / s / 2,
        }
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
  }, [index, teamAssets, contentRef])

  return (
    <div className="space-y-4">
      <p className="mx-auto max-w-[34rem] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-center text-xs leading-relaxed text-[var(--text-muted)]">
        Confrontos <strong className="font-semibold text-[var(--text)]">projetados</strong> pela
        classificação atual — atualizam conforme os jogos. Os melhores 3ºs e o chaveamento oficial
        são confirmados pela FIFA ao fim da fase de grupos.
      </p>

      {/* Dica de navegação: pan + zoom funcionam na web e no celular. */}
      <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
        <Hand size={14} aria-hidden="true" />
        Arraste ou use as setas para mover • pinça ou os botões para aproximar
      </p>

      <div ref={focusRef} className="relative">
        {/* Controles de zoom, sobrepostos ao chaveamento (web e mobile). */}
        <div className="absolute right-2 top-2 z-20 flex flex-col gap-1.5">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Aproximar"
            onClick={zoomIn}
            className="h-9 w-9 min-h-0 bg-[var(--surface)] shadow-sm"
          >
            <ZoomIn size={18} aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Afastar"
            onClick={zoomOut}
            className="h-9 w-9 min-h-0 bg-[var(--surface)] shadow-sm"
          >
            <ZoomOut size={18} aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Ajustar à tela"
            onClick={reset}
            className="h-9 w-9 min-h-0 bg-[var(--surface)] shadow-sm"
          >
            <Maximize size={18} aria-hidden="true" />
          </Button>
        </div>

        {/*
          Botões de navegação ←/→: saltam ~80% da largura por clique, para o
          usuário percorrer as fases sem arrastar. Cada um só aparece quando há
          conteúdo oculto naquele lado (o da esquerda surge depois que se navega
          para a direita). Centralizados na vertical, sobre o chaveamento.
        */}
        {canPanLeft && (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Navegar para a esquerda"
            onClick={pageLeft}
            className="absolute left-2 top-1/2 z-20 h-11 w-11 min-h-0 -translate-y-1/2 rounded-full border-0 bg-[var(--brand)] text-[var(--brand-text)] shadow-lg ring-2 ring-[var(--brand-text)]/30 transition hover:bg-[var(--brand)] hover:brightness-110"
          >
            <ChevronLeft size={24} strokeWidth={2.5} aria-hidden="true" />
          </Button>
        )}
        {canPanRight && (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Navegar para a direita"
            onClick={pageRight}
            className="absolute right-2 top-1/2 z-20 h-11 w-11 min-h-0 -translate-y-1/2 rounded-full border-0 bg-[var(--brand)] text-[var(--brand-text)] shadow-lg ring-2 ring-[var(--brand-text)]/30 transition hover:bg-[var(--brand)] hover:brightness-110"
          >
            <ChevronRight size={24} strokeWidth={2.5} aria-hidden="true" />
          </Button>
        )}

        {/*
          Viewport de altura fixa: recorta o conteúdo e captura os gestos
          (1 dedo = pan, 2 dedos = pinça; mouse arrasta, ctrl+wheel aproxima).
          O fit inicial mostra o chaveamento inteiro; o usuário aproxima depois.
        */}
        <div
          ref={viewportRef}
          {...handlers}
          className="relative h-[60vh] max-h-[40rem] cursor-grab touch-none select-none overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-soft)] active:cursor-grabbing"
        >
          {/*
            Chaveamento horizontal: cada fase é uma coluna lado a lado, do 16-avos
            (pontas) até a final (centro), espelhando a imagem oficial. As colunas
            têm a mesma altura e usam justify-around, então cada jogo se alinha no
            ponto médio entre seus dois alimentadores (8→4→2→1→1→1→2→4→8) — o efeito
            de funil/ampulheta clássico. O wrapper recebe o transform de zoom/pan.
          */}
          <div ref={contentRef} style={transformStyle} className="absolute left-0 top-0">
            <div className="relative flex w-max items-stretch gap-2.5 p-4 sm:gap-3.5 sm:p-6">
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
                  (a, b) =>
                    (BRACKET_VERTICAL_ORDER.get(a.no) ?? 0) - (BRACKET_VERTICAL_ORDER.get(b.no) ?? 0),
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
                          realMatch={realByNo.get(match.no) ?? null}
                          onOpen={openMatch}
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
      </div>
    </div>
  )
}

function ProjectedMatchCard({
  match,
  realMatch,
  onOpen,
  index,
  teamAssets,
  isFinal,
  registerRef,
}: {
  match: BracketMatch
  /** Confronto real já cadastrado no banco para este slot, ou `null`. */
  realMatch: Match | null
  /** Abre o detalhe do confronto real (só os slots já definidos são clicáveis). */
  onOpen: (match: Match) => void
  index: StandingsIndex
  teamAssets: Map<string, GroupTeamAsset>
  isFinal: boolean
  /** Registra o nó DOM do card para o cálculo das linhas de conexão. */
  registerRef?: (el: HTMLDivElement | null) => void
}) {
  // Confronto real do banco tem prioridade; sem ele, mostra o slot projetado.
  const home = realMatch ? teamSlotFromMatch(realMatch.homeTeam) : resolveSlot(match.home, index, teamAssets)
  const away = realMatch ? teamSlotFromMatch(realMatch.awayTeam) : resolveSlot(match.away, index, teamAssets)
  // Data/hora oficial do jogo (calendário FIFA fixo por número), exibida mesmo
  // sem os confrontos definidos. Para o confronto real bate com o scheduledAt.
  const kickoff = formatBracketKickoff(match.no)

  // Só os slots com confronto real cadastrado abrem o detalhe; os projetados
  // (sem partida no banco) seguem como antes, sem interação. O clique de mouse/
  // toque é resolvido pelo `onTap` do zoom/pan (o pointer capture do gesto faz
  // o click chegar no viewport, não no card) — aqui só tratamos o teclado.
  const open = realMatch ? () => onOpen(realMatch) : undefined
  const interactiveProps = open
    ? {
        role: 'button' as const,
        tabIndex: 0,
        'aria-label': `Ver detalhes de ${realMatch!.homeTeam.name} contra ${realMatch!.awayTeam.name}`,
        onKeyDown: (e: ReactKeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            open()
          }
        },
      }
    : {}

  return (
    <div
      ref={registerRef}
      data-match-no={match.no}
      {...interactiveProps}
      className={`rounded-[var(--radius-lg)] border bg-[var(--surface)] p-3 ${
        isFinal
          ? 'border-[var(--support)] shadow-[0_0_0_1px_var(--support)]'
          : 'border-[var(--border)]'
      }${
        open
          ? ' cursor-pointer transition duration-150 hover:border-[var(--brand)] focus:outline focus:outline-2 focus:outline-offset-[3px] focus:outline-[var(--brand)]'
          : ''
      }`}
    >
      {(kickoff || isFinal) && (
        <div className="mb-1.5 flex items-center justify-between text-[10px] font-medium tabular-nums text-[var(--text-muted)]">
          <span>{kickoff}</span>
          {isFinal && (
            <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-[0.14em] text-[var(--support)]">
              <Trophy size={12} aria-hidden="true" /> Taça
            </span>
          )}
        </div>
      )}
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
