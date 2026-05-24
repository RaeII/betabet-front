import { Link } from 'react-router-dom'
import { useActiveGroup } from '@/hooks/useActiveGroup'
import { useGroupMatches } from '@/hooks/useGroupMatches'
import { formatMatchDate } from '@/lib/date.utils'
import { formatScore } from '@/lib/format.utils'

export function GroupPalpitesPage() {
  const { groupId } = useActiveGroup()
  const { data, isLoading } = useGroupMatches(groupId ?? '')

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-[var(--text-muted)]">
        Carregando palpites…
      </div>
    )
  }

  const betted = (data?.matches ?? []).filter(m => m.userBet !== null)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text)]">Meus palpites</h1>

      {betted.length === 0 ? (
        <p className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)]">
          Você ainda não palpitou em nenhuma partida deste grupo.
        </p>
      ) : (
        <ul className="space-y-3">
          {betted.map(match => (
            <li key={match.id}>
              <Link
                to={`/groups/${groupId}/matches/${match.id}`}
                className="flex items-center justify-between rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--support)]"
              >
                <div className="min-w-0">
                  <p className="text-xs text-[var(--text-muted)]">
                    {formatMatchDate(match.scheduledAt)}
                  </p>
                  <p className="truncate text-sm font-semibold text-[var(--text)]">
                    {match.homeTeam.name} × {match.awayTeam.name}
                  </p>
                </div>
                <div className="text-right text-sm font-semibold text-[var(--brand)]">
                  {formatScore(match.userBet!.homeScore, match.userBet!.awayScore)}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
