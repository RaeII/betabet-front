import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, Clock3, UserRound, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useActiveGroup } from '@/hooks/useActiveGroup'
import { useHandleJoinRequest, useJoinRequests } from '@/hooks/useGroups'
import { MemberList } from '@/pages/group-detail/components/MemberList'
import { InvitePanel } from '@/pages/group-detail/components/InvitePanel'
import type { JoinRequest } from '@/types/group.types'

type MembersTab = 'members' | 'requests'

export function GroupMembersPage() {
  const { groupId, group, role } = useActiveGroup()
  const [searchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<MembersTab>(
    requestedTab === 'requests' ? 'requests' : 'members',
  )
  const isAdmin = role === 'admin'
  const requestsQuery = useJoinRequests(groupId ?? '', Boolean(groupId && isAdmin))

  useEffect(() => {
    if (requestedTab === 'requests') {
      setActiveTab('requests')
    }
  }, [requestedTab])

  if (!groupId) return null

  if (!group) {
    return (
      <div className="flex h-48 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text-muted)]">
        Carregando membros…
      </div>
    )
  }

  const requests = requestsQuery.data?.requests ?? []
  const visibleTab = isAdmin ? activeTab : 'members'
  const currentUserRole = role ?? 'member'

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[var(--text)]">Membros</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Gerencie pessoas, convite e solicitações de entrada do grupo.
        </p>
      </div>

      <section className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-semibold text-[var(--text)]">Convite</h2>
        <InvitePanel inviteCode={group.inviteCode} />
      </section>

      <section className="space-y-3">
        <div
          className="inline-flex rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] p-1"
          role="tablist"
          aria-label="Seções de membros"
        >
          <TabButton
            active={visibleTab === 'members'}
            onClick={() => setActiveTab('members')}
          >
            Membros
          </TabButton>
          {isAdmin ? (
            <TabButton
              active={visibleTab === 'requests'}
              onClick={() => setActiveTab('requests')}
              badge={requests.length}
            >
              Solicitações
            </TabButton>
          ) : null}
        </div>

        {visibleTab === 'members' ? (
          <MemberList groupId={groupId} currentUserRole={currentUserRole} />
        ) : (
          <JoinRequestsPanel
            groupId={groupId}
            requests={requests}
            isLoading={requestsQuery.isLoading}
            isError={requestsQuery.isError}
          />
        )}
      </section>
    </div>
  )
}

interface TabButtonProps {
  active: boolean
  children: string
  onClick: () => void
  badge?: number
}

function TabButton({ active, children, onClick, badge = 0 }: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        'flex min-h-10 items-center gap-2 rounded-[var(--radius-pill)] px-4 text-sm font-semibold transition',
        active
          ? 'bg-[var(--brand)] text-[var(--brand-text)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text)]',
      ].join(' ')}
    >
      <span>{children}</span>
      {badge > 0 ? (
        <span
          className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-center text-[11px] font-bold leading-none text-[var(--surface)]"
          aria-label={`${badge} solicitações pendentes`}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </button>
  )
}

interface JoinRequestsPanelProps {
  groupId: string
  requests: JoinRequest[]
  isLoading: boolean
  isError: boolean
}

function JoinRequestsPanel({ groupId, requests, isLoading, isError }: JoinRequestsPanelProps) {
  const handleRequest = useHandleJoinRequest(groupId)

  if (isLoading) {
    return (
      <p className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--text-muted)]">
        Carregando solicitações…
      </p>
    )
  }

  if (isError) {
    return (
      <p className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--danger)]">
        Não foi possível carregar as solicitações.
      </p>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface-soft)] text-[var(--brand)]">
          <Clock3 size={18} />
        </span>
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">Nenhuma solicitação pendente.</p>
          <p className="text-xs text-[var(--text-muted)]">Novos pedidos aparecerão aqui para aprovação.</p>
        </div>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {requests.map(request => (
        <li
          key={request.id}
          className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center"
        >
          <RequestIdentity request={request} />
          <div className="flex shrink-0 gap-2">
            <Button
              size="sm"
              onClick={() => handleRequest.mutate({ requestId: request.id, action: 'approve' })}
              disabled={handleRequest.isPending}
            >
              <Check size={14} />
              Aprovar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleRequest.mutate({ requestId: request.id, action: 'reject' })}
              disabled={handleRequest.isPending}
            >
              <X size={14} />
              Recusar
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}

function RequestIdentity({ request }: { request: JoinRequest }) {
  const requestedAt = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(request.createdAt))

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-soft)] text-sm font-bold text-[var(--brand)]">
        {request.user.avatarUrl ? (
          <img
            src={request.user.avatarUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <UserRound size={18} />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[var(--text)]">{request.user.name}</p>
        <p className="text-xs text-[var(--text-muted)]">Solicitou entrada em {requestedAt}</p>
      </div>
    </div>
  )
}
