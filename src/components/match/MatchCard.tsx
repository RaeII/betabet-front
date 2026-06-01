import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatMatchDate } from '@/lib/date.utils'
import { formatScore } from '@/lib/format.utils'
import type { Match } from '@/types/match.types'
import { MatchPointsBadge } from './MatchPointsBadge'
import { MatchStatusBadge } from './MatchStatusBadge'
import { MatchTeamIdentity } from './MatchTeamIdentity'

interface MatchCardProps {
  match: Match
  groupId?: string
}

export function MatchCard({ match, groupId }: MatchCardProps) {
  const href = groupId
    ? `/groups/${groupId}/matches/${match.id}`
    : `/matches/${match.id}`
  const score = formatScore(match.homeScore, match.awayScore)
  const hasScore = match.homeScore !== null && match.awayScore !== null
  const dateLabel = formatMatchDate(match.scheduledAt).split(',').join(' ')

  return (
    <Link
      to={href}
      aria-label={`Ver detalhes de ${match.homeTeam.name} contra ${match.awayTeam.name}`}
      className="group mx-auto block w-full max-w-[42rem] rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 transition duration-150 hover:border-[var(--brand)] focus:outline focus:outline-2 focus:outline-offset-[3px] focus:outline-[var(--brand)] active:scale-[0.99] sm:p-5"
    >
      <header className="flex items-center justify-between gap-3 text-xs font-medium text-[var(--text-muted)]">
        <span className="shrink-0 tabular-nums">{dateLabel}</span>
        <span className="min-w-0 truncate text-right">{match.stadium.name}</span>
      </header>

      <div className="mt-4 grid grid-cols-2 items-start justify-items-center gap-x-4 gap-y-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-5">
        <div className="min-w-0">
          <MatchTeamIdentity
            name={match.homeTeam.name}
            flagUrl={match.homeTeam.flagUrl}
            teamId={match.homeTeam.id}
          />
        </div>

        <div className="order-last col-span-2 flex min-h-16 flex-col items-center justify-center gap-2 sm:order-none sm:col-span-1 sm:min-w-32">
          <span
            className={`min-w-24 rounded-[var(--radius-md)] bg-[var(--surface-soft)] px-3 py-2 text-center text-lg font-bold tabular-nums text-[var(--text)] sm:text-xl ${
              hasScore ? '' : 'text-[var(--text-muted)]'
            }`}
          >
            {score}
          </span>
          <MatchStatusBadge status={match.status} />
          {groupId && match.status === 'live' ? (
            <MatchPointsBadge matchId={match.id} groupId={groupId} status={match.status} />
          ) : null}
        </div>

        <div className="min-w-0">
          <MatchTeamIdentity
            name={match.awayTeam.name}
            flagUrl={match.awayTeam.flagUrl}
            teamId={match.awayTeam.id}
          />
        </div>
      </div>

      <footer className="mt-4 flex min-h-8 items-center justify-center">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand)] transition duration-150 group-hover:opacity-75">
          Ver detalhes
          <ChevronRight size={14} aria-hidden="true" />
        </span>
      </footer>
    </Link>
  )
}
