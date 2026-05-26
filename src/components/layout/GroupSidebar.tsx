import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Award, Home, MessageSquare, Plus, Settings, Trophy, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useActiveGroup } from '@/hooks/useActiveGroup'
import { useJoinRequests } from '@/hooks/useGroups'
import { pathFor, sidebarDestinations } from '@/lib/sidebar-destinations'
import { GroupsModal } from '@/pages/groups/components/GroupsModal'
import { useTheme } from '@/hooks/useTheme'
import { Moon, Sun } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  trophy: Trophy,
  'message-square': MessageSquare,
  award: Award,
  users: Users,
  settings: Settings,
}

export function GroupSidebar() {
  const { groupId, isAdmin } = useActiveGroup()
  const [modalOpen, setModalOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const requestsQuery = useJoinRequests(groupId ?? '', Boolean(groupId && isAdmin))
  const isDark = theme === 'dark'

  if (!groupId) return null

  const items = sidebarDestinations.filter(item => !item.adminOnly || isAdmin)
  const pendingRequests = requestsQuery.data?.requests.length ?? 0

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
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--support)]',
                      isActive
                        ? 'bg-[var(--surface-soft)] text-[var(--brand)]'
                        : 'text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]',
                    ].join(' ')
                  }
                >
                  <Icon size={18} />
                  <span className="truncate">{item.label}</span>
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
        </ul>
      </nav>

      <div className="border-t border-[var(--border)] p-3">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="mb-2 flex w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-dashed border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)] hover:text-[var(--brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--support)]"
        >
          <Plus size={14} />
          Grupos
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)] transition hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--support)]"
        >
          {isDark ? <Sun size={12} /> : <Moon size={12} />}
          {isDark ? 'Claro' : 'Escuro'}
        </button>
      </div>

      <GroupsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        activeGroupId={groupId}
      />
    </aside>
  )
}
