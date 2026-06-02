import { useState } from 'react'
import { ShieldMinus, ShieldPlus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useAuth } from '@/hooks/useAuth'
import { useGroupMembers, useRemoveMember, useSetMemberRole } from '@/hooks/useGroups'
import type { GroupRole } from '@/types/group.types'

type MemberConfirmAction =
  | { type: 'promote'; userId: string; userName: string }
  | { type: 'demote'; userId: string; userName: string }
  | { type: 'remove'; userId: string; userName: string }

interface MemberListProps {
  groupId: string
  currentUserRole: GroupRole
  adminId: string
}

export function MemberList({ groupId, currentUserRole, adminId }: MemberListProps) {
  const { user } = useAuth()
  const { data } = useGroupMembers(groupId)
  const members = data?.members
  const removeMember = useRemoveMember(groupId)
  const setMemberRole = useSetMemberRole(groupId)
  const [confirmAction, setConfirmAction] = useState<MemberConfirmAction | null>(null)
  const isAdmin = currentUserRole === 'admin'
  const isPrimaryAdmin = user?.id === adminId
  const isConfirming = removeMember.isPending || setMemberRole.isPending

  function handleConfirm() {
    if (!confirmAction) return

    if (confirmAction.type === 'remove') {
      removeMember.mutate(confirmAction.userId, {
        onSuccess: () => setConfirmAction(null),
      })
      return
    }

    setMemberRole.mutate(
      {
        userId: confirmAction.userId,
        role: confirmAction.type === 'promote' ? 'admin' : 'member',
      },
      {
        onSuccess: () => setConfirmAction(null),
      },
    )
  }

  const confirmDialog =
    confirmAction?.type === 'promote'
      ? {
          title: 'Tornar admin',
          description: `Confirmar ${confirmAction.userName} como admin deste bolão?`,
          confirmLabel: 'Tornar admin',
          loadingLabel: 'Atualizando…',
          destructive: false,
        }
      : confirmAction?.type === 'demote'
        ? {
            title: 'Remover admin',
            description: `Remover permissões de admin de ${confirmAction.userName}?`,
            confirmLabel: 'Remover admin',
            loadingLabel: 'Atualizando…',
            destructive: true,
          }
        : confirmAction?.type === 'remove'
          ? {
              title: 'Remover membro',
              description: `Remover ${confirmAction.userName} deste bolão? Essa pessoa perderá acesso ao grupo.`,
              confirmLabel: 'Remover',
              loadingLabel: 'Removendo…',
              destructive: true,
            }
          : null

  if (!members?.length) {
    return <p className="text-sm text-[var(--text-muted)]">Nenhum membro encontrado.</p>
  }

  return (
    <>
      <ul className="space-y-2">
        {members.map(m => {
          const isPrimary = m.userId === adminId
          const roleLabel = isPrimary ? 'Admin principal' : m.role === 'admin' ? 'Admin' : 'Membro'
          return (
            <li key={m.userId} className="flex items-center gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-soft)] text-sm font-bold text-[var(--brand)]">
                {m.user.avatarUrl ? (
                  <img src={m.user.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  m.user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-[var(--text)]">{m.user.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{roleLabel}</p>
              </div>
              {isPrimaryAdmin && !isPrimary && m.role === 'member' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setConfirmAction({ type: 'promote', userId: m.userId, userName: m.user.name })}
                  disabled={isConfirming}
                  aria-label={`Tornar ${m.user.name} admin`}
                  title="Tornar admin"
                >
                  <ShieldPlus size={16} className="text-[var(--brand)]" />
                </Button>
              )}
              {isPrimaryAdmin && !isPrimary && m.role === 'admin' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setConfirmAction({ type: 'demote', userId: m.userId, userName: m.user.name })}
                  disabled={isConfirming}
                  aria-label={`Remover admin de ${m.user.name}`}
                  title="Remover admin"
                >
                  <ShieldMinus size={16} className="text-[var(--text-muted)]" />
                </Button>
              )}
              {isAdmin && !isPrimary && m.role !== 'admin' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setConfirmAction({ type: 'remove', userId: m.userId, userName: m.user.name })}
                  disabled={isConfirming}
                  aria-label={`Remover ${m.user.name}`}
                  title="Remover do bolão"
                >
                  <Trash2 size={16} className="text-[var(--danger)]" />
                </Button>
              )}
            </li>
          )
        })}
      </ul>
      <ConfirmDialog
        open={confirmDialog !== null}
        onOpenChange={open => {
          if (!open) setConfirmAction(null)
        }}
        title={confirmDialog?.title ?? ''}
        description={confirmDialog?.description}
        confirmLabel={confirmDialog?.confirmLabel}
        loadingLabel={confirmDialog?.loadingLabel}
        destructive={confirmDialog?.destructive}
        isLoading={isConfirming}
        onConfirm={handleConfirm}
      />
    </>
  )
}
