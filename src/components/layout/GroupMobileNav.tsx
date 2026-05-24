import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Award, Home, MessageSquare, Plus, Settings, Trophy, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useActiveGroup } from '@/hooks/useActiveGroup'
import { pathFor, sidebarDestinations } from '@/lib/sidebar-destinations'
import { GroupsModal } from '@/pages/groups/components/GroupsModal'

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  trophy: Trophy,
  'message-square': MessageSquare,
  award: Award,
  users: Users,
  settings: Settings,
}

export function GroupMobileNav() {
  const { groupId, isAdmin } = useActiveGroup()
  const [modalOpen, setModalOpen] = useState(false)

  if (!groupId) return null

  const items = sidebarDestinations.filter(item => !item.adminOnly || isAdmin)

  return (
    <>
      <nav
        aria-label="Navegação do grupo (mobile)"
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border)] bg-[var(--surface)] pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="flex items-center gap-1 overflow-x-auto px-2 py-1.5">
          {items.map(item => {
            const Icon = iconMap[item.iconName] ?? Home
            const to = pathFor(groupId, item)
            return (
              <li key={item.id} className="shrink-0">
                <NavLink
                  to={to}
                  end={item.to === ''}
                  className={({ isActive }) =>
                    [
                      'flex min-w-[64px] flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--support)]',
                      isActive
                        ? 'text-[var(--brand)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)]',
                    ].join(' ')
                  }
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            )
          })}
          <li className="shrink-0">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex min-w-[64px] flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--support)]"
            >
              <Plus size={20} />
              <span>Grupos</span>
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
