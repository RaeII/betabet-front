import type { MatchWithUserBet } from '@/types/match.types'
import { InlineBetCard } from './InlineBetCard'
import { FinishedMatchCard } from './FinishedMatchCard'
import type { BettingGroup } from '@/types/group.types'

interface DayMatchListProps {
  matches: MatchWithUserBet[]
  group: BettingGroup
}

// Ordem: ao vivo primeiro, depois mais recente primeiro (scheduledAt desc).
function getMatchPriority(match: MatchWithUserBet): number {
  if (match.status === 'live') return 0
  return 1
}

export function DayMatchList({ matches, group }: DayMatchListProps) {
  if (matches.length === 0) {
    return (
      <p className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 text-center text-sm text-[var(--text-muted)]">
        Nenhuma partida neste dia.
      </p>
    )
  }

  const sorted = [...matches].sort((a, b) => {
    const diff = getMatchPriority(a) - getMatchPriority(b)
    if (diff !== 0) return diff
    return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  })

  return (
    <div className="space-y-3">
      {sorted.map(match =>
        match.status === 'finished' ? (
          <FinishedMatchCard key={`${group.id}:${match.id}`} match={match} group={group} />
        ) : (
          <InlineBetCard
            key={`${group.id}:${match.id}`}
            match={match}
            groupId={group.id}
            groupInviteCode={group.inviteCode}
          />
        ),
      )}
    </div>
  )
}
