import type { MatchWithUserBet } from '@/types/match.types'
import { InlineBetCard } from './InlineBetCard'
import type { BettingGroup } from '@/types/group.types'

interface DayMatchListProps {
  matches: MatchWithUserBet[]
  group: BettingGroup
}

// Ordem: ao vivo primeiro, depois próximos jogos primeiro, depois encerrados.
function getMatchPriority(match: MatchWithUserBet): number {
  if (match.status === 'live') return 0
  if (match.status === 'upcoming') return 1
  return 2
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
    if (a.status === 'finished' && b.status === 'finished') {
      return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    }
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  })

  return (
    <div className="space-y-3">
      {sorted.map(match => (
        <InlineBetCard
          key={`${group.id}:${match.id}`}
          match={match}
          groupId={group.id}
          groupInviteCode={group.inviteCode}
        />
      ))}
    </div>
  )
}
