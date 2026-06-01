import { useMemo } from 'react'
import { useWorldCupStandings } from '@/hooks/useWorldCupStandings'
import type { MatchesResponse } from '@/types/match.types'
import type { WorldCupStanding } from '@/types/worldCup.types'
import { WorldCupGroupMatchesList } from './WorldCupGroupMatchesList'
import { WorldCupStandingsTable } from './WorldCupStandingsTable'
import {
  getGroupMatches,
  getGroupTeamAssets,
  normalizeGroupLetter,
  rowUpdate,
  sortGroupLetters,
} from './worldCupGroup.utils'

interface WorldCupGroupOverviewProps {
  data: MatchesResponse['groupStage']
  groupId?: string
}

export function WorldCupGroupOverview({ data, groupId }: WorldCupGroupOverviewProps) {
  const standingsQuery = useWorldCupStandings()

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
        const updatedAt = rowUpdate(rows, standingsQuery.data?.meta.cachedAt)

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
              <span className="shrink-0 text-xs font-medium text-[var(--text-muted)]">
                {matches.length} {matches.length === 1 ? 'jogo' : 'jogos'}
              </span>
            </header>

            <WorldCupStandingsTable
              groupLetter={groupLetter}
              rows={rows}
              isLoading={standingsQuery.isLoading}
              isError={standingsQuery.isError}
              isFetching={standingsQuery.isFetching}
              updatedAt={updatedAt}
              teamAssets={teamAssets}
            />

            <WorldCupGroupMatchesList
              groupLetter={groupLetter}
              matches={matches}
              groupId={groupId}
            />
          </section>
        )
      })}
    </div>
  )
}
