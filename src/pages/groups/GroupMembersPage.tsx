import { useActiveGroup } from '@/hooks/useActiveGroup'
import { MemberList } from '@/pages/group-detail/components/MemberList'
import { InvitePanel } from '@/pages/group-detail/components/InvitePanel'

export function GroupMembersPage() {
  const { groupId, group, role } = useActiveGroup()
  if (!groupId || !group || !role) return null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text)]">Membros</h1>

      <section className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-semibold text-[var(--text)]">Convite</h2>
        <InvitePanel groupId={groupId} inviteCode={group.inviteCode} role={role} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--text)]">Pessoas</h2>
        <MemberList groupId={groupId} currentUserRole={role} />
      </section>
    </div>
  )
}
