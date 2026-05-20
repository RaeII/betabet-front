import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGroupMembers, useRemoveMember } from '@/hooks/useGroups'
import type { GroupRole } from '@/types/group.types'

interface MemberListProps {
  groupId: string
  currentUserRole: GroupRole
}

export function MemberList({ groupId, currentUserRole }: MemberListProps) {
  const { data } = useGroupMembers(groupId)
  const members = data?.members
  const removeMember = useRemoveMember(groupId)
  const isAdmin = currentUserRole === 'admin'

  if (!members?.length) {
    return <p className="text-sm text-[var(--text-muted)]">Nenhum membro encontrado.</p>
  }

  return (
    <ul className="space-y-2">
      {members.map(m => (
        <li key={m.userId} className="flex items-center gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-soft)] text-sm font-bold text-[var(--brand)]">
            {m.user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-[var(--text)]">{m.user.name}</p>
            <p className="text-xs text-[var(--text-muted)]">
              {m.role === 'admin' ? 'Admin' : 'Membro'}
            </p>
          </div>
          {isAdmin && m.role !== 'admin' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeMember.mutate(m.userId)}
              disabled={removeMember.isPending}
              aria-label={`Remover ${m.user.name}`}
            >
              <Trash2 size={16} className="text-[var(--danger)]" />
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
}
