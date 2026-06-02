import { useState } from 'react'
import { ShieldMinus, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useGroupMembers, useSetMemberRole } from '@/hooks/useGroups'
import type { BettingGroup } from '@/types/group.types'

interface GroupAdminsSectionProps {
  group: BettingGroup
}

export function GroupAdminsSection({ group }: GroupAdminsSectionProps) {
  const { user } = useAuth()
  const { data } = useGroupMembers(group.id)
  const setMemberRole = useSetMemberRole(group.id)
  const [selectedUserId, setSelectedUserId] = useState('')

  const members = data?.members ?? []
  const isPrimaryAdmin = user?.id === group.adminId
  const admins = members.filter(m => m.role === 'admin')
  const eligibleMembers = members.filter(m => m.role === 'member')

  function handleAddAdmin() {
    if (!selectedUserId) return
    setMemberRole.mutate(
      { userId: selectedUserId, role: 'admin' },
      { onSuccess: () => setSelectedUserId('') },
    )
  }

  return (
    <section className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[var(--text)]">Admins</h2>
        <p className="text-xs leading-relaxed text-[var(--text-muted)]">
          {isPrimaryAdmin
            ? 'Apenas o admin principal pode adicionar ou remover admins.'
            : 'Somente o admin principal pode gerenciar os admins do bolão.'}
        </p>
      </div>

      <ul className="space-y-2">
        {admins.map(m => {
          const isPrimary = m.userId === group.adminId
          return (
            <li
              key={m.userId}
              className="flex items-center gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-soft)] p-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--brand)]">
                <ShieldCheck size={16} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-[var(--text)]">{m.user.name}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {isPrimary ? 'Admin principal' : 'Admin'}
                </p>
              </div>
              {isPrimaryAdmin && !isPrimary && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMemberRole.mutate({ userId: m.userId, role: 'member' })}
                  disabled={setMemberRole.isPending}
                  aria-label={`Remover admin de ${m.user.name}`}
                  title="Remover admin"
                >
                  <ShieldMinus size={16} className="text-[var(--danger)]" />
                </Button>
              )}
            </li>
          )
        })}
      </ul>

      {isPrimaryAdmin && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={selectedUserId}
            onChange={e => setSelectedUserId(e.target.value)}
            disabled={eligibleMembers.length === 0}
            aria-label="Selecionar membro para tornar admin"
            className="min-h-12 flex-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--brand)] focus:outline-none focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--brand)_10%,transparent)] disabled:opacity-50"
          >
            <option value="">
              {eligibleMembers.length === 0 ? 'Nenhum membro disponível' : 'Selecionar membro…'}
            </option>
            {eligibleMembers.map(m => (
              <option key={m.userId} value={m.userId}>
                {m.user.name}
              </option>
            ))}
          </select>
          <Button
            type="button"
            onClick={handleAddAdmin}
            disabled={!selectedUserId || setMemberRole.isPending}
          >
            {setMemberRole.isPending ? 'Adicionando…' : 'Adicionar admin'}
          </Button>
        </div>
      )}
    </section>
  )
}
