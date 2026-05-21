import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useGroup, useUserGroups } from '@/hooks/useGroups'
import { useAllMatches } from '@/hooks/useMatches'
import { useGroupRanking } from '@/hooks/useRanking'
import { MemberList } from '@/pages/group-detail/components/MemberList'
import { InvitePanel } from '@/pages/group-detail/components/InvitePanel'
import { GroupSettings } from '@/pages/group-detail/components/GroupSettings'
import { GroupRanking } from '@/pages/group-detail/components/GroupRanking'
import { GroupDesktopRail } from './components/GroupDesktopRail'
import { GroupHomeHero } from './components/GroupHomeHero'
import { GroupMatchPreviewSection } from './components/GroupMatchPreviewSection'
import { GroupMobileHeader } from './components/GroupMobileHeader'
import { GroupRankingPreview } from './components/GroupRankingPreview'
import { GroupStatePanel } from './components/GroupStatePanel'
import type { Match } from '@/types/match.types'
import type { GroupRole } from '@/types/group.types'

function byDateAsc(a: Match, b: Match) {
  return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
}

function byDateDesc(a: Match, b: Match) {
  return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
}

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const { user } = useAuth()
  const groupsQuery = useUserGroups()
  const { data, isLoading, isError } = useGroup(groupId ?? '')
  const matchesQuery = useAllMatches()
  const rankingQuery = useGroupRanking(groupId ?? '')
  const groups = groupsQuery.data?.groups ?? []

  const matches = matchesQuery.data ?? []
  const upcomingMatches = useMemo(
    () =>
      matches
        .filter(match => match.status === 'upcoming' && new Date(match.scheduledAt).getTime() >= Date.now())
        .sort(byDateAsc)
        .slice(0, 3),
    [matches],
  )
  const pastMatches = useMemo(
    () =>
      matches
        .filter(match => match.status === 'finished' || new Date(match.scheduledAt).getTime() < Date.now())
        .sort(byDateDesc)
        .slice(0, 3),
    [matches],
  )

  const shellClass = 'grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]'

  if (isLoading) {
    return (
      <div data-testid="group-detail-shell" className="overflow-x-hidden">
        <div className={shellClass}>
          <GroupDesktopRail groups={groups} activeGroupId={groupId} isLoading={groupsQuery.isLoading} />
          <GroupStatePanel title="Carregando grupo..." className="min-h-48 lg:max-w-3xl" />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div data-testid="group-detail-shell" className="overflow-x-hidden">
        <div className={shellClass}>
          <GroupDesktopRail groups={groups} activeGroupId={groupId} isLoading={groupsQuery.isLoading} />
          <GroupStatePanel
            title="Grupo não encontrado."
            description="Volte para a lista de grupos e escolha outro grupo disponível."
            className="min-h-48 lg:max-w-3xl"
          />
        </div>
      </div>
    )
  }

  const { group } = data
  const role = (data.role as GroupRole) ?? 'member'
  const isAdmin = role === 'admin'
  const ranking = rankingQuery.data?.ranking ?? []
  const primaryMatchHref = upcomingMatches[0]
    ? `/groups/${group.id}/matches/${upcomingMatches[0].id}`
    : undefined

  return (
    <div data-testid="group-detail-shell" className="overflow-x-hidden">
      <div className={shellClass}>
        <GroupDesktopRail groups={groups} activeGroupId={group.id} isLoading={groupsQuery.isLoading} />

        <main className="min-w-0 space-y-6 lg:max-w-[940px]">
          <GroupMobileHeader group={group} role={role} />
          <GroupHomeHero group={group} role={role} primaryMatchHref={primaryMatchHref} />

          <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
            <div className="min-w-0 space-y-6">
              <GroupMatchPreviewSection
                id="proximas-partidas"
                title="Próximas partidas"
                matches={upcomingMatches}
                groupId={group.id}
                emptyMessage="Nenhuma próxima partida."
              />
              <GroupMatchPreviewSection
                title="Partidas passadas"
                matches={pastMatches}
                groupId={group.id}
                emptyMessage="Nenhuma partida passada."
              />
            </div>

            <div className="min-w-0">
              <GroupRankingPreview
                ranking={ranking}
                currentUserId={user?.id}
                isLoading={rankingQuery.isLoading}
              />
            </div>
          </div>

          <section id="detalhes-grupo" className="grid gap-6 xl:grid-cols-2">
            <div className="min-w-0 space-y-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-lg font-semibold text-[var(--text)]">Convite</h2>
              <InvitePanel groupId={group.id} inviteCode={group.inviteCode} role={role} />
            </div>

            {isAdmin && (
              <div className="min-w-0 space-y-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
                <h2 className="text-lg font-semibold text-[var(--text)]">Configurações</h2>
                <GroupSettings group={group} />
              </div>
            )}
          </section>

          <section id="membros-grupo" className="grid gap-6 xl:grid-cols-2">
            <div className="min-w-0 space-y-3">
              <h2 className="text-lg font-semibold text-[var(--text)]">Membros</h2>
              <MemberList groupId={group.id} currentUserRole={role} />
            </div>

            <div id="ranking-completo" className="min-w-0 space-y-3">
              <h2 className="text-lg font-semibold text-[var(--text)]">Ranking completo</h2>
              <GroupRanking groupId={group.id} />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
