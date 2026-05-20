import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useMatch, useMatchDistribution } from '@/hooks/useMatches'
import { useUserGroups } from '@/hooks/useGroups'
import { useAuth } from '@/hooks/useAuth'
import { TeamFlag } from '@/components/match/TeamFlag'
import { MatchStatusBadge } from '@/components/match/MatchStatusBadge'
import { BetForm } from './components/BetForm'
import { BetsGrid } from './components/BetsGrid'
import { DistributionChart } from './components/DistributionChart'
import { isBetEditable, formatMatchDate, formatCountdown } from '@/lib/date.utils'
import { getGroupMatchBets } from '@/services/bets.service'

export function MatchDetailPage() {
  const { matchId, groupId } = useParams<{ matchId: string; groupId?: string }>()
  const { user } = useAuth()
  const { data: match, isLoading, isError } = useMatch(matchId ?? '')
  const { data: groupsData } = useUserGroups()

  const hasStarted = match && (match.status === 'live' || match.status === 'finished')
  const { data: distribution } = useMatchDistribution(matchId ?? '', !!user?.chartUnlocked && !!hasStarted)

  const { data: betsData } = useQuery({
    queryKey: ['group-match-bets', groupId, matchId],
    queryFn: () => getGroupMatchBets(groupId!, matchId!),
    enabled: !!groupId && !!matchId,
  })

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-[var(--text-muted)]">
        Carregando partida…
      </div>
    )
  }

  if (isError || !match) {
    return (
      <div className="flex h-48 items-center justify-center text-[var(--danger)]">
        Partida não encontrada.
      </div>
    )
  }

  const isLocked = !isBetEditable(match.scheduledAt)
  const userGroupCount = groupsData?.groups?.length ?? 0
  const activeGroupId = groupId ?? groupsData?.groups?.[0]?.id ?? ''

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Match header */}
      <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6">
        <TeamFlag name={match.homeTeam.name} flagUrl={match.homeTeam.flagUrl} size="lg" />

        <div className="flex flex-col items-center gap-2">
          {hasStarted ? (
            <span className="text-3xl font-bold tracking-tight text-[var(--text)]">
              {match.homeScore} × {match.awayScore}
            </span>
          ) : (
            <span className="text-sm font-semibold text-[var(--text-muted)]">
              {formatCountdown(match.scheduledAt)}
            </span>
          )}
          <MatchStatusBadge status={match.status} />
          <span className="text-xs text-[var(--text-muted)]">{formatMatchDate(match.scheduledAt)}</span>
          {match.stadium && (
            <span className="text-xs text-[var(--text-muted)]">
              {match.stadium.name}, {match.stadium.city}
            </span>
          )}
        </div>

        <TeamFlag name={match.awayTeam.name} flagUrl={match.awayTeam.flagUrl} size="lg" />
      </div>

      {/* Distribution chart (unlocked users only, after match starts) */}
      {distribution && user?.chartUnlocked && (
        <DistributionChart
          data={distribution}
          homeTeamName={match.homeTeam.name}
          awayTeamName={match.awayTeam.name}
        />
      )}

      {/* Bet form */}
      {(match.status === 'upcoming' || match.status === 'live') && activeGroupId && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[var(--text)]">Sua aposta</h2>
          <BetForm
            matchId={match.id}
            groupId={activeGroupId}
            existingBet={match.userBet}
            isLocked={isLocked}
            userGroupCount={userGroupCount}
          />
        </section>
      )}

      {match.status === 'finished' && match.userBet && (
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-center">
          <p className="text-sm text-[var(--text-muted)]">Sua aposta</p>
          <p className="text-2xl font-bold text-[var(--text)]">
            {match.userBet.homeScore} × {match.userBet.awayScore}
          </p>
        </div>
      )}

      {/* Bets grid (group context only) */}
      {groupId && betsData && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[var(--text)]">Apostas do grupo</h2>
          <BetsGrid bets={betsData.bets} canView={betsData.canView} />
        </section>
      )}
    </div>
  )
}
