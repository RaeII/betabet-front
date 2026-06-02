import { Plus, Ticket } from 'lucide-react'
import type { BettingGroup, MyJoinRequest } from '@/types/group.types'
import { GroupAvatar } from './GroupAvatar'

interface GroupsModalListProps {
  groups: BettingGroup[]
  activeGroupId: string | null
  pendingRequests: MyJoinRequest[]
  isLoadingRequests: boolean
  onSelect: (groupId: string) => void
  onJoin: () => void
  onCreate: () => void
}

export function GroupsModalList({
  groups,
  activeGroupId,
  pendingRequests,
  isLoadingRequests,
  onSelect,
  onJoin,
  onCreate,
}: GroupsModalListProps) {
  const hasPendingRequests = pendingRequests.length > 0

  return (
    <div className="space-y-3 p-5">
      <ul className="space-y-2" aria-label="Lista de bolões">
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
                  'focus:outline focus:outline-2 focus:outline-offset-[3px] focus:outline-[var(--brand)]',
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

      {isLoadingRequests || hasPendingRequests ? (
        <section className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Aguardando aprovação
            </h3>
            {hasPendingRequests ? (
              <span className="rounded-full bg-[var(--surface-soft)] px-2 py-1 text-[11px] font-semibold text-[var(--text-muted)]">
                {pendingRequests.length}
              </span>
            ) : null}
          </div>

          {isLoadingRequests && !hasPendingRequests ? (
            <p className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-muted)]">
              Carregando solicitações...
            </p>
          ) : (
            <ul className="space-y-2" aria-label="Bolões aguardando aprovação">
              {pendingRequests.map(request => (
                <li
                  key={request.id}
                  className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5"
                >
                  <GroupAvatar
                    name={request.groupName}
                    coverUrl={request.groupCoverUrl}
                    emoji={request.groupEmoji}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--text)]">
                      {request.groupName}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Solicitação enviada
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[var(--surface-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-muted)]">
                    Pendente
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <div
        role="separator"
        className="flex items-center gap-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]"
      >
        <span className="flex-1 border-t border-[var(--border)]" />
        ou
        <span className="flex-1 border-t border-[var(--border)]" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onJoin}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)] hover:text-[var(--brand)] focus:outline focus:outline-2 focus:outline-offset-[3px] focus:outline-[var(--brand)]"
        >
          <Ticket size={16} />
          Entrar em um bolão
        </button>
        <button
          type="button"
          onClick={onCreate}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-dashed border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)] hover:text-[var(--brand)] focus:outline focus:outline-2 focus:outline-offset-[3px] focus:outline-[var(--brand)]"
        >
          <Plus size={16} />
          Criar novo bolão
        </button>
      </div>
    </div>
  )
}
