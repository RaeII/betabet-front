import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { MatchCard } from '@/components/match/MatchCard'
import {
  findDefaultRound,
  getGroupRounds,
  type GroupMatch,
} from './worldCupGroup.utils'

/** Id no DOM do card de uma partida — alvo do scroll do botão "Jogo ao vivo". */
export function matchCardDomId(matchId: string): string {
  return `jogo-${matchId}`
}

interface WorldCupGroupMatchesListProps {
  groupLetter: string
  matches: GroupMatch[]
  groupId?: string
  /** Partida ao vivo no calendário (qualquer grupo); usada para centralizar o card. */
  liveMatchId?: string | null
  /** Incrementa a cada clique no botão "Jogo ao vivo" — dispara o scroll. */
  scrollSignal?: number
  backState?: Record<string, unknown>
}

export function WorldCupGroupMatchesList({
  groupLetter,
  matches,
  groupId,
  liveMatchId,
  scrollSignal,
  backState,
}: WorldCupGroupMatchesListProps) {
  const rounds = useMemo(() => getGroupRounds(matches), [matches])
  const defaultRound = useMemo(() => findDefaultRound(rounds), [rounds])
  const [selectedRound, setSelectedRound] = useState<string | null>(null)
  const pendingScrollId = useRef<string | null>(null)

  useEffect(() => {
    setSelectedRound(current => {
      if (current && rounds.some(round => round.value === current)) return current
      return defaultRound
    })
  }, [defaultRound, rounds])

  // Botão "Jogo ao vivo" clicado: se a partida ao vivo está neste grupo,
  // seleciona a rodada dela e agenda o scroll para depois da re-renderização.
  useEffect(() => {
    if (!scrollSignal || !liveMatchId) return
    const liveRound = rounds.find(round => round.matches.some(match => match.id === liveMatchId))
    if (!liveRound) return
    pendingScrollId.current = liveMatchId
    setSelectedRound(liveRound.value)
  }, [scrollSignal])

  // Executa o scroll após a rodada certa estar montada (roda a cada render,
  // guardado pelo ref para só agir quando há um alvo pendente).
  useEffect(() => {
    if (!pendingScrollId.current) return
    const target = document.getElementById(matchCardDomId(pendingScrollId.current))
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      pendingScrollId.current = null
    }
  })

  const activeRound = rounds.find(round => round.value === (selectedRound ?? defaultRound))
  const activeRoundIndex = activeRound
    ? rounds.findIndex(round => round.value === activeRound.value)
    : -1

  function moveRound(direction: -1 | 1) {
    if (rounds.length <= 1 || activeRoundIndex < 0) return
    const nextIndex = (activeRoundIndex + direction + rounds.length) % rounds.length
    setSelectedRound(rounds[nextIndex]?.value ?? null)
  }

  return (
    <section className="space-y-3" aria-label={`Jogos do Grupo ${groupLetter}`}>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            <CalendarDays size={14} aria-hidden="true" />
            Jogos
          </p>
          <h3 className="text-lg font-semibold text-[var(--text)]">
            Jogos do Grupo {groupLetter}
          </h3>
        </div>

        {activeRound ? (
          <div className="flex items-center justify-between gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] p-1 sm:justify-start">
            <button
              type="button"
              onClick={() => moveRound(-1)}
              disabled={rounds.length <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition duration-150 hover:bg-[var(--surface-soft)] hover:text-[var(--text)] focus:outline focus:outline-2 focus:outline-offset-[3px] focus:outline-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`Ver rodada anterior do Grupo ${groupLetter}`}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <div className="min-w-28 px-2 text-center">
              <p className="text-sm font-semibold text-[var(--text)]">{activeRound.label}</p>
              <p className="text-[11px] font-medium text-[var(--text-muted)]">
                {activeRound.matches.length} {activeRound.matches.length === 1 ? 'jogo' : 'jogos'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => moveRound(1)}
              disabled={rounds.length <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition duration-150 hover:bg-[var(--surface-soft)] hover:text-[var(--text)] focus:outline focus:outline-2 focus:outline-offset-[3px] focus:outline-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`Ver próxima rodada do Grupo ${groupLetter}`}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </header>

      {!activeRound ? (
        <div className="flex h-40 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] px-4 text-center text-sm text-[var(--text-muted)]">
          Jogos ainda não importados para este grupo.
        </div>
      ) : (
        <div className="space-y-3">
          {activeRound.matches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              groupId={groupId}
              cardId={matchCardDomId(match.id)}
              backState={backState}
            />
          ))}
        </div>
      )}
    </section>
  )
}
