import { Link } from 'react-router-dom'
import { MatchCard } from '@/components/match/MatchCard'
import { isBetEditable } from '@/lib/date.utils'
import type { MatchWithUserBet } from '@/types/match.types'

interface UnbettedMatchesProps {
  matches: MatchWithUserBet[]
}

export function UnbettedMatches({ matches }: UnbettedMatchesProps) {
  const unbetted = matches.filter(
    m => m.status === 'upcoming' && m.userBet === null && isBetEditable(m.scheduledAt),
  )

  if (unbetted.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--text)]">Aposte Agora</h2>
        <span className="text-xs text-[var(--text-muted)]">{unbetted.length} sem aposta</span>
      </div>
      <div className="space-y-2">
        {unbetted.slice(0, 3).map(match => (
          <MatchCard key={match.id} match={match} />
        ))}
        {unbetted.length > 3 && (
          <Link to="/matches" className="block text-center text-sm text-[var(--brand)] hover:underline">
            Ver mais {unbetted.length - 3} jogos sem aposta
          </Link>
        )}
      </div>
    </section>
  )
}
