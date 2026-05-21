import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GroupAvatar } from './GroupAvatar'
import type { BettingGroup } from '@/types/group.types'

interface GroupCardProps {
  group: BettingGroup
  userRank?: number | null
  isActive?: boolean
  compact?: boolean
  className?: string
}

export function GroupCard({ group, userRank, isActive = false, compact = false, className }: GroupCardProps) {
  return (
    <Link
      to={`/groups/${group.id}`}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex min-w-0 items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 transition duration-200 hover:border-[var(--brand)] hover:bg-[var(--surface-soft)]',
        isActive && 'border-[var(--brand)] bg-[var(--surface-soft)]',
        compact && 'p-3',
        className,
      )}
    >
      <GroupAvatar name={group.name} coverUrl={group.coverUrl} size={compact ? 'sm' : 'md'} />

      <div className="flex-1 min-w-0">
        <p className="truncate font-semibold text-[var(--text)]">{group.name}</p>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <Users size={12} />
          <span>{group.memberCount} membros</span>
        </div>
      </div>

      {userRank !== undefined && userRank !== null && (
        <div className="flex shrink-0 flex-col items-center">
          <span className="text-lg font-bold text-[var(--brand)]">#{userRank}</span>
          <span className="text-xs text-[var(--text-muted)]">rank</span>
        </div>
      )}
    </Link>
  )
}
