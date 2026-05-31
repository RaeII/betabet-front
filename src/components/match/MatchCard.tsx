import { Link } from 'react-router-dom'
import { TeamFlag } from './TeamFlag'
import { MatchStatusBadge } from './MatchStatusBadge'
import { MatchPointsBadge } from './MatchPointsBadge'
import { formatMatchDate } from '@/lib/date.utils'
import { formatScore } from '@/lib/format.utils'
import type { Match } from '@/types/match.types'

interface MatchCardProps {
  match: Match
  groupId?: string
}

export function MatchCard({ match, groupId }: MatchCardProps) {
  const href = groupId
    ? `/groups/${groupId}/matches/${match.id}`
    : `/matches/${match.id}`

  return (
    <Link
      to={href}
      className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--brand)]/30 hover:bg-[var(--surface-soft)]"
    >
      <TeamFlag
        name={match.homeTeam.name}
        flagUrl={match.homeTeam.flagUrl}
        teamId={match.homeTeam.id}
        size="sm"
      />

      <div className="flex flex-1 flex-col items-center gap-1">
        <span className="text-lg font-bold tracking-tight text-[var(--text)]">
          {formatScore(match.homeScore, match.awayScore)}
        </span>
        <MatchStatusBadge status={match.status} />
        <span className="text-xs text-[var(--text-muted)]">{formatMatchDate(match.scheduledAt)}</span>
        {groupId && match.status === 'live' ? (
          <MatchPointsBadge matchId={match.id} groupId={groupId} status={match.status} />
        ) : null}
      </div>

      <TeamFlag
        name={match.awayTeam.name}
        flagUrl={match.awayTeam.flagUrl}
        teamId={match.awayTeam.id}
        size="sm"
      />
    </Link>
  )
}
