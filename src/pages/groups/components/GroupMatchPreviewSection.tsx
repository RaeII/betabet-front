import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { MatchStatusBadge } from '@/components/match/MatchStatusBadge'
import { formatMatchDate } from '@/lib/date.utils'
import { formatScore } from '@/lib/format.utils'
import type { Match } from '@/types/match.types'

interface GroupMatchPreviewSectionProps {
  id?: string
  title: string
  matches: Match[]
  groupId: string
  emptyMessage: string
}

export function GroupMatchPreviewSection({
  id,
  title,
  matches,
  groupId,
  emptyMessage,
}: GroupMatchPreviewSectionProps) {
  return (
    <section id={id} className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>
        <span className="text-xs font-medium text-[var(--text-muted)]">{matches.length} jogos</span>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text-muted)]">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map(match => (
            <Link
              key={match.id}
              to={`/groups/${groupId}/matches/${match.id}`}
              aria-label={`${match.homeTeam.name} contra ${match.awayTeam.name}`}
              className="flex min-w-0 items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-3 transition duration-200 hover:border-[var(--brand)] hover:bg-[var(--surface-soft)]"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--text)]">
                  {match.homeTeam.name} vs {match.awayTeam.name}
                </p>
                <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                  {formatMatchDate(match.scheduledAt)} · {match.stadium.name}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-sm font-bold text-[var(--text)]">
                  {formatScore(match.homeScore, match.awayScore)}
                </span>
                <MatchStatusBadge status={match.status} />
              </div>
              <ArrowRight size={16} className="hidden shrink-0 text-[var(--text-muted)] sm:block" />
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
