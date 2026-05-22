import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GroupAvatar } from './GroupAvatar'
import type { BettingGroup, GroupRole } from '@/types/group.types'

interface GroupMobileHeaderProps {
  group: BettingGroup
  role: GroupRole
}

export function GroupMobileHeader({ group, role }: GroupMobileHeaderProps) {
  return (
    <div
      data-testid="group-mobile-header"
      className="min-w-0 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 lg:hidden"
    >
      <Button asChild variant="secondary" size="sm" className="mb-4">
        <Link to="/groups">
          <ArrowLeft size={16} />
          Ver grupos
        </Link>
      </Button>

      <div className="flex min-w-0 items-center gap-3">
        <GroupAvatar name={group.name} coverUrl={group.coverUrl} emoji={group.emoji} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-[var(--text)]">{group.name}</p>
          <p className="text-xs text-[var(--text-muted)]">
            {group.memberCount} membros · {role === 'admin' ? 'Admin' : 'Membro'}
          </p>
        </div>
      </div>
    </div>
  )
}
