import { Plus } from 'lucide-react'
import type { BettingGroup } from '@/types/group.types'
import { GroupAvatar } from './GroupAvatar'

interface GroupsModalListProps {
  groups: BettingGroup[]
  activeGroupId: string | null
  onSelect: (groupId: string) => void
  onCreate: () => void
}

export function GroupsModalList({
  groups,
  activeGroupId,
  onSelect,
  onCreate,
}: GroupsModalListProps) {
  return (
    <div className="space-y-3 p-5">
      <ul className="space-y-2" aria-label="Lista de grupos">
        {groups.map(group => {
          const isActive = group.id === activeGroupId
          return (
            <li key={group.id}>
              <button
                type="button"
                onClick={() => onSelect(group.id)}
                aria-current={isActive ? 'true' : undefined}
                className={[
                  'flex w-full items-center gap-3 rounded-[var(--radius-xl)] border px-3 py-2.5 text-left transition',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--support)]',
                  isActive
                    ? 'border-[var(--brand)] bg-[var(--surface-soft)]'
                    : 'border-[var(--border)] hover:bg-[var(--surface-soft)]',
                ].join(' ')}
              >
                <GroupAvatar
                  name={group.name}
                  coverUrl={group.coverUrl}
                  emoji={group.emoji}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--text)]">
                    {group.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {group.memberCount} {group.memberCount === 1 ? 'membro' : 'membros'}
                  </p>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <div
        role="separator"
        className="flex items-center gap-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]"
      >
        <span className="flex-1 border-t border-[var(--border)]" />
        ou
        <span className="flex-1 border-t border-[var(--border)]" />
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-dashed border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)] hover:text-[var(--brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--support)]"
      >
        <Plus size={16} />
        Criar novo grupo
      </button>
    </div>
  )
}
