import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import type { BettingGroup } from '@/types/group.types'

interface GroupCardProps {
  group: BettingGroup
  userRank?: number | null
}

export function GroupCard({ group, userRank }: GroupCardProps) {
  return (
    <Link
      to={`/groups/${group.id}`}
      className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--brand)]/30 hover:bg-[var(--surface-soft)]"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius)] bg-[var(--surface-soft)]">
        {group.coverUrl ? (
          <img src={group.coverUrl} alt={group.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl">🏆</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate font-semibold text-[var(--text)]">{group.name}</p>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <Users size={12} />
          <span>{group.memberCount} membros</span>
        </div>
      </div>

      {userRank !== undefined && userRank !== null && (
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-[var(--brand)]">#{userRank}</span>
          <span className="text-xs text-[var(--text-muted)]">rank</span>
        </div>
      )}
    </Link>
  )
}
