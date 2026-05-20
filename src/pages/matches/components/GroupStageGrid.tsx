import { MatchCard } from '@/components/match/MatchCard'
import type { Match, MatchesResponse } from '@/types/match.types'

interface GroupStageGridProps {
  data: MatchesResponse['groupStage']
}

export function GroupStageGrid({ data }: GroupStageGridProps) {
  const groups = Object.entries(data).sort(([a], [b]) => a.localeCompare(b))

  if (groups.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-[var(--text-muted)]">
        Nenhuma partida encontrada.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      {groups.map(([groupLetter, matchdays]) => (
        <section key={groupLetter}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Grupo {groupLetter}
          </h2>
          <div className="space-y-4">
            {Object.entries(matchdays)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([matchday, matches]) => (
                <div key={matchday}>
                  <p className="mb-2 text-xs text-[var(--text-muted)]">Rodada {matchday}</p>
                  <div className="space-y-2">
                    {(matches as Match[]).map(match => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}
