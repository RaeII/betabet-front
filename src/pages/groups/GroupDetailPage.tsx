import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGroup } from '@/hooks/useGroups'
import { MemberList } from '@/pages/group-detail/components/MemberList'
import { InvitePanel } from '@/pages/group-detail/components/InvitePanel'
import { GroupSettings } from '@/pages/group-detail/components/GroupSettings'
import { GroupRanking } from '@/pages/group-detail/components/GroupRanking'
import { cn } from '@/lib/utils'
import type { GroupRole } from '@/types/group.types'

type Tab = 'ranking' | 'members' | 'matches'

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const { data, isLoading, isError } = useGroup(groupId ?? '')
  const [tab, setTab] = useState<Tab>('ranking')

  if (isLoading) {
    return <div className="flex h-48 items-center justify-center text-[var(--text-muted)]">Carregando grupo…</div>
  }

  if (isError || !data) {
    return <div className="flex h-48 items-center justify-center text-[var(--danger)]">Grupo não encontrado.</div>
  }

  const { group } = data
  const role = (data.role as GroupRole) ?? 'member'
  const isAdmin = role === 'admin'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius)] bg-[var(--surface-soft)] text-3xl">
          {group.coverUrl ? (
            <img src={group.coverUrl} alt={group.name} className="h-full w-full rounded-[var(--radius)] object-cover" />
          ) : '🏆'}
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">{group.name}</h1>
          <p className="text-sm text-[var(--text-muted)]">{group.memberCount} membros · {isAdmin ? 'Admin' : 'Membro'}</p>
        </div>
      </div>

      {/* Invite panel (visible to all, requests only to admin) */}
      <InvitePanel groupId={group.id} inviteCode={group.inviteCode} role={role} />

      {/* Admin settings */}
      {isAdmin && <GroupSettings group={group} />}

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)]" role="tablist">
        {(['ranking', 'members', 'matches'] as Tab[]).map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              tab === t
                ? 'border-b-2 border-[var(--brand)] text-[var(--brand)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]',
            )}
          >
            {t === 'ranking' ? 'Ranking' : t === 'members' ? 'Membros' : 'Partidas'}
          </button>
        ))}
      </div>

      {tab === 'ranking' && <GroupRanking groupId={group.id} />}
      {tab === 'members' && <MemberList groupId={group.id} currentUserRole={role} />}
      {tab === 'matches' && (
        <p className="text-sm text-[var(--text-muted)]">Partidas do grupo em breve.</p>
      )}
    </div>
  )
}
