import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Award, Home, Plus, Trophy, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useActiveGroup } from '@/hooks/useActiveGroup'
import { useJoinRequests } from '@/hooks/useGroups'
import { pathFor, sidebarDestinations } from '@/lib/sidebar-destinations'
import { GroupsModal } from '@/pages/groups/components/GroupsModal'

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  trophy: Trophy,
  award: Award,
  users: Users,
}

const hiddenMobileItemIds = new Set(['palpites', 'configuracoes'])

const navItemClass = [
  'flex h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 text-center text-[11px] font-medium transition-colors',
  'focus:outline focus:outline-2 focus:outline-offset-[3px] focus:outline-[var(--brand)]',
].join(' ')

function centerHomeItem(items: typeof sidebarDestinations) {
  const homeItem = items.find(item => item.id === 'home')
  if (!homeItem) return items

  const sideItems = items.filter(item => item.id !== 'home')
  const leftItemCount = Math.floor((sideItems.length + 1) / 2)

  return [
    ...sideItems.slice(0, leftItemCount),
    homeItem,
    ...sideItems.slice(leftItemCount),
  ]
}

export function GroupMobileNav() {
  const { groupId, isAdmin } = useActiveGroup()
  const [modalOpen, setModalOpen] = useState(false)
  const requestsQuery = useJoinRequests(groupId ?? '', Boolean(groupId && isAdmin))

  if (!groupId) return null

  const items = centerHomeItem(
    sidebarDestinations.filter(
      item => !hiddenMobileItemIds.has(item.id) && (!item.adminOnly || isAdmin),
    ),
  )
  const pendingRequests = requestsQuery.data?.requests.length ?? 0
  const totalNavItems = items.length + 1

  return (
    <>
      <nav
        aria-label="Navegação do grupo (mobile)"
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border)] bg-[var(--surface)] pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul
          className="grid items-center gap-1 px-2 py-1.5"
          style={{ gridTemplateColumns: `repeat(${totalNavItems}, minmax(0, 1fr))` }}
        >
          {items.map(item => {
            const Icon = iconMap[item.iconName] ?? Home
            const hasPendingMemberRequests = item.id === 'membros' && pendingRequests > 0
            const to = hasPendingMemberRequests
              ? `${pathFor(groupId, item)}?tab=requests`
              : pathFor(groupId, item)
            return (
              <li key={item.id} className="min-w-0">
                <NavLink
                  to={to}
                  end={item.to === ''}
                  className={({ isActive }) =>
                    [
                      navItemClass,
                      isActive
                        ? 'text-[var(--brand)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)]',
                    ].join(' ')
                  }
                >
                  <span className="relative flex h-5 w-5 items-center justify-center">
                    <Icon size={20} />
                    {item.id === 'membros' && pendingRequests > 0 ? (
                      <span
                        className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-center text-[10px] font-bold leading-none text-[var(--surface)]"
                        aria-label={`${pendingRequests} solicitações pendentes`}
                      >
                        {pendingRequests > 99 ? '99+' : pendingRequests}
                      </span>
                    ) : null}
                  </span>
                  <span className="block max-w-full truncate text-center leading-3">{item.label}</span>
                </NavLink>
              </li>
            )
          })}
          <li className="min-w-0">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className={`${navItemClass} w-full text-[var(--text-muted)] hover:text-[var(--text)]`}
            >
              <Plus size={20} />
              <span className="block max-w-full truncate text-center leading-3">Grupos</span>
            </button>
          </li>
        </ul>
      </nav>

      <GroupsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        activeGroupId={groupId}
      />
    </>
  )
}
