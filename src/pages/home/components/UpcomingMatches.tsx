import { Link } from 'react-router-dom'
import { MatchCard } from '@/components/match/MatchCard'
import type { Match } from '@/types/match.types'

interface UpcomingMatchesProps {
  matches: Match[]
}

export function UpcomingMatches({ matches }: UpcomingMatchesProps) {
  const upcoming = matches
    .filter(m => m.status === 'upcoming')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 5)

  if (upcoming.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--text)]">Próximos Jogos</h2>
        <Link to="/matches" className="text-sm text-[var(--brand)] hover:underline">
          Ver todos
        </Link>
      </div>
      <div className="space-y-2">
        {upcoming.map(match => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  )
}
