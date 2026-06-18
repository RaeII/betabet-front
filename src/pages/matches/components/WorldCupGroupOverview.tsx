import { useMemo, useState } from 'react'
import { useWorldCupStandings } from '@/hooks/useWorldCupStandings'
import type { MatchesResponse } from '@/types/match.types'
import type { WorldCupStanding } from '@/types/worldCup.types'
import { WorldCupGroupMatchesList } from './WorldCupGroupMatchesList'
import { WorldCupStandingsTable } from './WorldCupStandingsTable'
import {
  getGroupMatches,
  getGroupTeamAssets,
  normalizeGroupLetter,
  sortGroupLetters,
} from './worldCupGroup.utils'

interface WorldCupGroupOverviewProps {
  data: MatchesResponse['groupStage']
  groupId?: string
  backState?: Record<string, unknown>
}

export function WorldCupGroupOverview({ data, groupId, backState }: WorldCupGroupOverviewProps) {
  const standingsQuery = useWorldCupStandings()
  const [scrollSignal, setScrollSignal] = useState(0)

  const standingsByGroup = useMemo(() => {
    const map = new Map<string, WorldCupStanding[]>()
    for (const rows of standingsQuery.data?.data.league.standings ?? []) {
      const groupLetter = normalizeGroupLetter(rows.find(row => row.group)?.group)
      if (groupLetter) map.set(groupLetter, [...rows].sort((a, b) => a.rank - b.rank))
    }
    return map
  }, [standingsQuery.data])

  const groupOptions = useMemo(() => {
    const groups = new Set<string>()
    Object.keys(data).forEach(group => groups.add(normalizeGroupLetter(group)))
    standingsByGroup.forEach((_rows, group) => groups.add(group))
    return [...groups].filter(Boolean).sort(sortGroupLetters)
  }, [data, standingsByGroup])

  const liveMatchId = useMemo(() => {
    for (const groupLetter of groupOptions) {
      const live = getGroupMatches(data, groupLetter).find(({ match }) => match.status === 'live')
      if (live) return live.match.id
    }
    return null
  }, [data, groupOptions])

  if (groupOptions.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-[var(--text-muted)]">
        Nenhum grupo encontrado.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      {groupOptions.map(groupLetter => {
        const rows = standingsByGroup.get(groupLetter) ?? []
        const matches = getGroupMatches(data, groupLetter)
        const teamAssets = getGroupTeamAssets(matches)

        return (
          <section
            key={groupLetter}
            className="mx-auto w-full max-w-[42rem] space-y-4"
            aria-labelledby={`grupo-${groupLetter}`}
          >
            <header className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-[var(--brand-text)]">
                  {groupLetter}
                </span>
                <div className="min-w-0">
                  <h2 id={`grupo-${groupLetter}`} className="text-xl font-semibold text-[var(--text)]">
                    Grupo {groupLetter}
                  </h2>
                  <p className="text-sm text-[var(--text-muted)]">
                    Classificação e jogos por rodada
                  </p>
                </div>
              </div>
            </header>

            <WorldCupStandingsTable
              rows={rows}
              isLoading={standingsQuery.isLoading}
              isError={standingsQuery.isError}
              teamAssets={teamAssets}
            />

            <WorldCupGroupMatchesList
              groupLetter={groupLetter}
              matches={matches}
              groupId={groupId}
              liveMatchId={liveMatchId}
              scrollSignal={scrollSignal}
              backState={backState}
            />
          </section>
        )
      })}

      {liveMatchId ? (
        <button
          type="button"
          onClick={() => setScrollSignal(signal => signal + 1)}
          className="fixed bottom-20 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-600 shadow-lg backdrop-blur-sm transition duration-150 hover:bg-red-500/20 focus:outline focus:outline-2 focus:outline-offset-[3px] focus:outline-red-500 active:scale-95 lg:bottom-8 lg:right-8"
          aria-label="Centralizar no jogo ao vivo"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          Jogo ao vivo
        </button>
      ) : null}
    </div>
  )
}
