import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useMatch, useMatchDistribution, useMatchLive, useMatchPostMatch, useMatchPreview } from '@/hooks/useMatches'
import { useUserGroups } from '@/hooks/useGroups'
import { useGroupMatches } from '@/hooks/useGroupMatches'
import { useAuth } from '@/hooks/useAuth'
import { useLiveMatchNotifications } from '@/hooks/useLiveMatchNotifications'
import { TeamFlag } from '@/components/match/TeamFlag'
import { MatchStatusBadge } from '@/components/match/MatchStatusBadge'
import { BetForm } from './components/BetForm'
import { BetsGrid } from './components/BetsGrid'
import { DistributionChart } from './components/DistributionChart'
import { PreMatchProbability } from './components/PreMatchProbability'
import { PreMatchLineup } from './components/PreMatchLineup'
import { PreMatchInjuries } from './components/PreMatchInjuries'
import { PreMatchVenue } from './components/PreMatchVenue'
import { LiveScoreboard } from './components/LiveScoreboard'
import { LiveEventsTimeline } from './components/LiveEventsTimeline'
import { LiveStats } from './components/LiveStats'
import { PostMatchScoreboard } from './components/PostMatchScoreboard'
import { isBetEditable, formatMatchDate, formatCountdown } from '@/lib/date.utils'
import { getGroupMatchBets } from '@/services/bets.service'

export function MatchDetailPage() {
  const { matchId, groupId } = useParams<{ matchId: string; groupId?: string }>()
  const { user } = useAuth()
  const groupMatchesQuery = useGroupMatches(groupId ?? '')
  const matchQuery = useMatch(matchId ?? '', !groupId)
  const { data: groupsData } = useUserGroups()
  const groupMatch = groupMatchesQuery.data?.matches.find(m => m.id === matchId)
  const match = groupId ? groupMatch : matchQuery.data
  const isLoading = groupId ? groupMatchesQuery.isLoading : matchQuery.isLoading
  const isError = groupId ? groupMatchesQuery.isError : matchQuery.isError

  const hasStarted = match && (match.status === 'live' || match.status === 'finished')
  const isUpcoming = match?.status === 'upcoming'
  const isLiveStatus = match?.status === 'live'
  const isFinishedStatus = match?.status === 'finished'
  const { data: distribution } = useMatchDistribution(matchId ?? '', !!user?.chartUnlocked && !!hasStarted)
  const { data: preview } = useMatchPreview(matchId ?? '', !!isUpcoming)
  const { data: live } = useMatchLive(matchId ?? '', !!isLiveStatus)
  const { data: postMatch } = useMatchPostMatch(matchId ?? '', !!hasStarted)
  useLiveMatchNotifications(matchId ?? '', live?.events)

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
  const activeGroup = groupsData?.groups?.find(g => g.id === activeGroupId)

  // ─── Finished detection ──────────────────────────────────────────
  // O backend interno só marca `status='finished'` quando o admin confirma o
  // resultado; enquanto isso o upstream da API-Football já reporta FT/AET/PEN.
  // Tratar qualquer um dos dois como "encerrado" pra evitar o jogo ficar
  // sempre exibindo o bloco "ao vivo".
  const TERMINAL_STATUSES = new Set(['FT', 'AET', 'PEN'])
  const isUpstreamFinished = !!live && TERMINAL_STATUSES.has(live.status.short)
  const isFinishedView = isFinishedStatus || isUpstreamFinished

  // Fonte canônica do snapshot pós-jogo: prioriza o salvo no banco; se ainda
  // não houve coleta (cron roda a cada 10 min), usa a resposta `live` corrente
  // (que já está em FT/AET/PEN no upstream e cacheada por 1h no backend).
  const postSource =
    postMatch?.hasPostMatchData
      ? {
          statusShort: postMatch.status.short,
          goalsHome: postMatch.goals.home,
          goalsAway: postMatch.goals.away,
          homeWinner: postMatch.teams?.home.winner ?? null,
          awayWinner: postMatch.teams?.away.winner ?? null,
          round: postMatch.league?.round ?? null,
          score: postMatch.score,
          events: postMatch.events,
          statistics: postMatch.statistics,
          lineups: postMatch.lineups,
          homeTeamId: postMatch.teams?.home.id ?? null,
          awayTeamId: postMatch.teams?.away.id ?? null,
          venueName: postMatch.venue?.name ?? null,
          venueCity: postMatch.venue?.city ?? null,
        }
      : isUpstreamFinished && live
      ? {
          statusShort: live.status.short,
          goalsHome: live.goals.home,
          goalsAway: live.goals.away,
          homeWinner: null,
          awayWinner: null,
          round: live.league?.round ?? null,
          score: live.score,
          events: live.events,
          statistics: live.statistics,
          lineups: live.lineups,
          homeTeamId: live.teams?.home.id ?? null,
          awayTeamId: live.teams?.away.id ?? null,
          venueName: live.venue?.name ?? null,
          venueCity: live.venue?.city ?? null,
        }
      : null

  const showPostMatchBlock = isFinishedView && !!postSource
  const showLiveBlock = isLiveStatus && live && live.hasApiFixtureId && !isUpstreamFinished
  const liveHomeTeamId = live?.teams?.home.id ?? null
  const liveStadiumName = live?.venue?.name ?? match.stadium?.name ?? null
  const liveStadiumCity = live?.venue?.city ?? match.stadium?.city ?? null
  const postStadiumName = postSource?.venueName ?? match.stadium?.name ?? null
  const postStadiumCity = postSource?.venueCity ?? match.stadium?.city ?? null

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Match header */}
      {showPostMatchBlock && postSource ? (
        <div className="space-y-1.5">
          <PostMatchScoreboard
            statusShort={postSource.statusShort}
            homeTeamName={match.homeTeam.name}
            homeTeamFlag={match.homeTeam.flagUrl}
            homeWinner={postSource.homeWinner}
            homeGoals={postSource.goalsHome}
            awayTeamName={match.awayTeam.name}
            awayTeamFlag={match.awayTeam.flagUrl}
            awayWinner={postSource.awayWinner}
            awayGoals={postSource.goalsAway}
            round={postSource.round}
            score={postSource.score}
            events={postSource.events}
            homeTeamId={postSource.homeTeamId}
            awayTeamId={postSource.awayTeamId}
          />
          {postStadiumName ? (
            <p className="pl-1 text-xs text-[var(--text-muted)]">
              {postStadiumName}
              {postStadiumCity ? `, ${postStadiumCity}` : ''}
            </p>
          ) : null}
        </div>
      ) : showLiveBlock ? (
        <div className="space-y-1.5">
          <LiveScoreboard
            live={live}
            homeTeamName={match.homeTeam.name}
            homeTeamFlag={match.homeTeam.flagUrl}
            awayTeamName={match.awayTeam.name}
            awayTeamFlag={match.awayTeam.flagUrl}
          />
          {liveStadiumName ? (
            <p className="pl-1 text-xs text-[var(--text-muted)]">
              {liveStadiumName}
              {liveStadiumCity ? `, ${liveStadiumCity}` : ''}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="shrink-0">
            <TeamFlag name={match.homeTeam.name} flagUrl={match.homeTeam.flagUrl} size="lg" />
          </div>

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

          <div className="shrink-0">
            <TeamFlag name={match.awayTeam.name} flagUrl={match.awayTeam.flagUrl} size="lg" />
          </div>
        </div>
      )}

      {match.userBet ? (
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-soft)] p-3 text-center">
          <p className="text-xs text-[var(--text-muted)]">Seu palpite</p>
          <p className="text-xl font-bold text-[var(--text)]">
            {match.userBet.homeScore} × {match.userBet.awayScore}
          </p>
        </div>
      ) : null}

      {/* Live blocks (em andamento) */}
      {showLiveBlock && (
        <div className="space-y-4">
          <LiveStats statistics={live.statistics} homeTeamId={liveHomeTeamId} />
          <LiveEventsTimeline events={live.events} homeTeamId={liveHomeTeamId} />
          {live.lineups.length > 0 ? (
            <PreMatchLineup
              lineups={live.lineups}
              headerLabel="Escalação"
            />
          ) : null}
        </div>
      )}

      {/* Post-match blocks (encerrada — fonte: snapshot DB ou live cacheado em FT) */}
      {showPostMatchBlock && postSource && (
        <div className="space-y-4">
          <LiveStats statistics={postSource.statistics} homeTeamId={postSource.homeTeamId} />
          <LiveEventsTimeline events={postSource.events} homeTeamId={postSource.homeTeamId} />
          {postSource.lineups.length > 0 ? (
            <PreMatchLineup lineups={postSource.lineups} headerLabel="Escalação" />
          ) : null}
        </div>
      )}

      {/* Distribution chart (unlocked users only, after match starts) */}
      {distribution && user?.chartUnlocked && (
        <DistributionChart
          data={distribution}
          homeTeamName={match.homeTeam.name}
          awayTeamName={match.awayTeam.name}
        />
      )}

      {/* Pre-match data (probability, lineups, injuries, venue) */}
      {isUpcoming && preview ? (
        <div className="space-y-4">
          {preview.prediction ? (
            <PreMatchProbability
              prediction={preview.prediction}
              homeName={match.homeTeam.name}
              awayName={match.awayTeam.name}
            />
          ) : null}

          {preview.lineups.length > 0 ? <PreMatchLineup lineups={preview.lineups} /> : null}

          <PreMatchInjuries
            injuries={preview.injuries}
            homeTeamName={match.homeTeam.name}
            awayTeamName={match.awayTeam.name}
          />

          <PreMatchVenue
            venue={preview.venue}
            referee={preview.referee}
            fallbackStadiumName={match.stadium?.name ?? null}
            fallbackStadiumCity={match.stadium?.city ?? null}
          />
        </div>
      ) : null}

      {/* Bets grid (group context only) */}
      {groupId && betsData && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[var(--text)]">Apostas do grupo</h2>
          <BetsGrid
            bets={betsData.bets}
            canView={betsData.canView}
            groupInviteCode={activeGroup?.inviteCode}
          />
        </section>
      )}
    </div>
  )
}
