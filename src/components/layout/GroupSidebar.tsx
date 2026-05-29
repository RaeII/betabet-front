import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Award, Home, Plus, Trophy, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useActiveGroup } from '@/hooks/useActiveGroup'
import { useGroupMatches } from '@/hooks/useGroupMatches'
import { useJoinRequests } from '@/hooks/useGroups'
import { pathFor, sidebarDestinations } from '@/lib/sidebar-destinations'
import { GroupsModal } from '@/pages/groups/components/GroupsModal'

const hiddenSidebarItemIds = new Set(['palpites', 'configuracoes'])

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  trophy: Trophy,
  award: Award,
  users: Users,
}

function LiveDot() {
  return (
    <span
      className="relative ml-auto flex h-2 w-2 shrink-0"
      aria-label="Partida ao vivo"
      role="img"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
    </span>
  )
}

export function GroupSidebar() {
  const { groupId, isAdmin } = useActiveGroup()
  const [modalOpen, setModalOpen] = useState(false)
  const requestsQuery = useJoinRequests(groupId ?? '', Boolean(groupId && isAdmin))
  const matchesQuery = useGroupMatches(groupId ?? '')

  if (!groupId) return null

  const items = sidebarDestinations.filter(
    item => !hiddenSidebarItemIds.has(item.id) && (!item.adminOnly || isAdmin),
  )
  const pendingRequests = requestsQuery.data?.requests.length ?? 0
  const hasLiveMatch = matchesQuery.data?.matches.some(m => m.status === 'live') ?? false

  return (
    <aside className="hidden lg:flex lg:flex-col md:rounded-[var(--radius-sm)] lg:border lg:border-[var(--border)] lg:bg-[var(--surface)] lg:sticky lg:top-4 lg:self-start lg:h-[calc(100vh-2rem)] lg:overflow-hidden">
      <Link
        to="/"
        aria-label="betabet"
        className="flex h-16 shrink-0 items-center gap-2 border-b border-[var(--border)] px-4"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)] text-[var(--brand-text)]">
          <Trophy size={16} />
        </span>
        <span className="text-sm font-bold tracking-tight">betabet</span>
      </Link>

      <nav aria-label="Navegação do grupo" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {items.map(item => {
            const Icon = iconMap[item.iconName] ?? Home
            const hasPendingMemberRequests = item.id === 'membros' && pendingRequests > 0
            const to = hasPendingMemberRequests
              ? `${pathFor(groupId, item)}?tab=requests`
              : pathFor(groupId, item)
            return (
              <li key={item.id}>
                <NavLink
                  to={to}
                  end={item.to === ''}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-[var(--radius-pill)] px-3 py-2 text-sm font-medium transition',
                      'focus:outline focus:outline-2 focus:outline-offset-[3px] focus:outline-[var(--brand)]',
                      isActive
                        ? 'bg-[var(--surface-soft)] text-[var(--brand)]'
                        : 'text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]',
                    ].join(' ')
                  }
                >
                  <Icon size={18} />
                  <span className="truncate">{item.label}</span>
                  {item.id === 'jogos' && hasLiveMatch ? <LiveDot /> : null}
                  {item.id === 'membros' && pendingRequests > 0 ? (
                    <span
                      className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-center text-[11px] font-bold leading-none text-[var(--surface)]"
                      aria-label={`${pendingRequests} solicitações pendentes`}
                    >
                      {pendingRequests > 99 ? '99+' : pendingRequests}
                    </span>
                  ) : null}
                </NavLink>
              </li>
            )
          })}
          <li>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className={[
                'flex w-full items-center gap-3 rounded-[var(--radius-pill)] px-3 py-2 text-sm font-medium transition',
                'text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]',
                'focus:outline focus:outline-2 focus:outline-offset-[3px] focus:outline-[var(--brand)]',
              ].join(' ')}
            >
              <Plus size={18} />
              <span className="truncate">Bolões</span>
            </button>
          </li>
        </ul>
      </nav>

      <GroupsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        activeGroupId={groupId}
      />
    </aside>
  )
}
