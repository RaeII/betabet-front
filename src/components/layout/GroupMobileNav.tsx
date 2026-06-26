import { useState } from 'react'
import { NavLink, useMatch, useNavigate } from 'react-router-dom'
import { Award, Home, Plus, Swords, Trophy, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useActiveGroup } from '@/hooks/useActiveGroup'
import { useGroupHasLiveMatch } from '@/hooks/useGroupLiveMatch'
import { useMyJoinRequests } from '@/hooks/useGroups'
import { useSeenFlag } from '@/hooks/useSeenFlag'
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
  const navigate = useNavigate()
  const [matamataIsNew, dismissMatamata] = useSeenFlag('betabet:matamata-seen')
  const [modalOpen, setModalOpen] = useState(false)
  const groupMatchesListRoute = useMatch({ path: '/groups/:groupId/jogos', end: true })
  const globalMatchesListRoute = useMatch({ path: '/matches', end: true })
  const groupMatchDetailRoute = useMatch({ path: '/groups/:groupId/matches/:matchId', end: true })
  const globalMatchDetailRoute = useMatch({ path: '/matches/:matchId', end: true })
  const isMatchesListRoute = Boolean(groupMatchesListRoute || globalMatchesListRoute)
  const currentMatchId =
    groupMatchDetailRoute?.params.matchId ?? globalMatchDetailRoute?.params.matchId
  const myRequestsQuery = useMyJoinRequests(Boolean(groupId))
  const hasLiveMatch = useGroupHasLiveMatch(groupId ?? '', {
    enabled: !isMatchesListRoute,
    suppressWhenViewingMatchId: currentMatchId,
  })
  const showLiveMatch = hasLiveMatch && !isMatchesListRoute

  if (!groupId) return null

  const items = centerHomeItem(
    sidebarDestinations.filter(
      item => !hiddenMobileItemIds.has(item.id) && (!item.adminOnly || isAdmin),
    ),
  )
  const pendingApprovals = myRequestsQuery.data?.requests.length ?? 0
  const totalNavItems = items.length + 2

  return (
    <>
      <nav
        aria-label="Navegação do bolão (mobile)"
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border)] bg-[var(--surface)] pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul
          className="grid items-center gap-1 px-2 py-1.5"
          style={{ gridTemplateColumns: `repeat(${totalNavItems}, minmax(0, 1fr))` }}
        >
          {items.map(item => {
            const Icon = iconMap[item.iconName] ?? Home
            return (
              <li key={item.id} className="min-w-0">
                <NavLink
                  to={pathFor(groupId, item)}
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
                    {item.id === 'jogos' && showLiveMatch ? (
                      <span
                        className="absolute -right-1.5 -top-1 flex h-2.5 w-2.5"
                        aria-label="Partida ao vivo"
                        role="img"
                      >
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
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
              onClick={() => {
                dismissMatamata()
                navigate(`/groups/${groupId}/jogos`, { state: { phase: 'knockout' } })
              }}
              className={`${navItemClass} w-full text-[var(--text-muted)] hover:text-[var(--text)]`}
            >
              <span className="relative flex h-5 w-5 items-center justify-center">
                <Swords size={20} />
                {matamataIsNew ? (
                  <span
                    className="absolute -top-2.5 -right-4 rounded-[var(--radius-pill)] bg-[#ff1f1f] px-1 text-[8px] font-bold uppercase leading-tight tracking-wide text-white"
                    aria-label="Novidade"
                  >
                    new
                  </span>
                ) : null}
              </span>
              <span className="block max-w-full truncate text-center leading-3">Mata-mata</span>
            </button>
          </li>
          <li className="min-w-0">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className={`${navItemClass} w-full text-[var(--text-muted)] hover:text-[var(--text)]`}
            >
              <span className="relative flex h-5 w-5 items-center justify-center">
                <Plus size={20} />
                {pendingApprovals > 0 ? (
                  <span
                    className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-center text-[10px] font-bold leading-none text-[var(--surface)]"
                    aria-label={`${pendingApprovals} ${pendingApprovals === 1 ? 'bolão aguardando aprovação' : 'bolões aguardando aprovação'}`}
                  >
                    {pendingApprovals > 99 ? '99+' : pendingApprovals}
                  </span>
                ) : null}
              </span>
              <span className="block max-w-full truncate text-center leading-3">Bolões</span>
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
