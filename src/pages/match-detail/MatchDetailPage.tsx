import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useMatch, useMatchDistribution, useMatchLive, useMatchPostMatch, useMatchPreview } from '@/hooks/useMatches'
import { useUserGroups } from '@/hooks/useGroups'
import { useGroupMatches } from '@/hooks/useGroupMatches'
import { useAuth } from '@/hooks/useAuth'
import { useLiveMatchNotifications } from '@/hooks/useLiveMatchNotifications'
import { TeamFlag } from '@/components/match/TeamFlag'
import { MatchPointsBadge } from '@/components/match/MatchPointsBadge'
import { MatchStatusBadge } from '@/components/match/MatchStatusBadge'
import { BetsGrid } from './components/BetsGrid'
import { DistributionChart } from './components/DistributionChart'
import { PreMatchProbability } from './components/PreMatchProbability'
import { PreMatchLineup } from './components/PreMatchLineup'
import { PreMatchInjuries } from './components/PreMatchInjuries'
import { PreMatchRecentForm } from './components/PreMatchRecentForm'
import { PreMatchVenue } from './components/PreMatchVenue'
import { LiveScoreboard } from './components/LiveScoreboard'
import { LiveEventsTimeline } from './components/LiveEventsTimeline'
import { LiveStats } from './components/LiveStats'
import { PostMatchScoreboard } from './components/PostMatchScoreboard'
import { MatchPointsCard } from './components/MatchPointsCard'
import { formatMatchDate, formatCountdown } from '@/lib/date.utils'
import { getGroupMatchBets } from '@/services/bets.service'

const MATCH_START_REFRESH_INTERVAL_MS = 30_000
const MATCH_START_REFRESH_WINDOW_MS = 2 * 60 * 60_000
const MAX_TIMEOUT_MS = 2_147_483_647

// Status do upstream em que o jogo está na prorrogação (ou pênaltis) durante o
// ao vivo: ET = prorrogação, BT = intervalo da prorrogação, P = disputa de pênaltis.
const LIVE_EXTRA_TIME_STATUSES = new Set(['ET', 'BT', 'P'])

// Mensagem exibida abaixo do card do resultado quando o jogo foi/está na
// prorrogação. O placar que vale para os pontos considera a prorrogação; a
// disputa de pênaltis NÃO conta (vale o empate) — ver Doc backend 011.
function extraTimeNotice(statusShort: string): string | null {
  if (statusShort === 'PEN' || statusShort === 'P') {
    return 'O resultado considera o tempo de prorrogação. A disputa de pênaltis não conta para os pontos — o jogo vale como empate.'
  }
  if (statusShort === 'AET' || statusShort === 'ET' || statusShort === 'BT') {
    return 'O resultado considerado para os pontos inclui o tempo de prorrogação.'
  }
  return null
}

export function MatchDetailPage() {
  const { matchId, groupId } = useParams<{ matchId: string; groupId?: string }>()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'details' | 'bets'>('details')
  const groupMatchesQuery = useGroupMatches(groupId ?? '')
  const matchQuery = useMatch(matchId ?? '', !groupId)
  const { data: groupsData } = useUserGroups()
  const groupMatch = groupMatchesQuery.data?.matches.find(m => m.id === matchId)
  const match = groupId ? groupMatch : matchQuery.data
  const isLoading = groupId ? groupMatchesQuery.isLoading : matchQuery.isLoading
  const isError = groupId ? groupMatchesQuery.isError : matchQuery.isError
  const refetchGroupMatches = groupMatchesQuery.refetch
  const refetchMatchDetail = matchQuery.refetch

  const hasStartedStatus = match && (match.status === 'live' || match.status === 'finished')
  const isUpcomingStatus = match?.status === 'upcoming'
  const isLiveStatus = match?.status === 'live'
  const isFinishedStatus = match?.status === 'finished'
  const { data: distribution } = useMatchDistribution(matchId ?? '', !!user?.chartUnlocked && !!hasStartedStatus)
  const { data: preview } = useMatchPreview(matchId ?? '', !!isUpcomingStatus)
  const { data: live } = useMatchLive(matchId ?? '', !!isLiveStatus)
  const { data: postMatch } = useMatchPostMatch(matchId ?? '', !!hasStartedStatus)
  useLiveMatchNotifications(matchId ?? '', live?.events)

  const { data: betsData } = useQuery({
    queryKey: ['group-match-bets', groupId, matchId],
    queryFn: () => getGroupMatchBets(groupId!, matchId!),
    enabled: !!groupId && !!matchId,
  })

  useEffect(() => {
    if (!match || match.status !== 'upcoming') return

    const kickoff = new Date(match.scheduledAt).getTime()
    if (Number.isNaN(kickoff)) return

    let timeoutId: ReturnType<typeof window.setTimeout> | undefined
    let intervalId: ReturnType<typeof window.setInterval> | undefined

    const refetchMatch = () => {
      if (groupId) {
        void refetchGroupMatches()
        return
      }

      void refetchMatchDetail()
    }

    const startPolling = () => {
      const msUntilKickoff = kickoff - Date.now()

      if (msUntilKickoff > 0) {
        timeoutId = window.setTimeout(startPolling, Math.min(msUntilKickoff, MAX_TIMEOUT_MS))
        return
      }

      if (Date.now() - kickoff > MATCH_START_REFRESH_WINDOW_MS) return

      refetchMatch()
      intervalId = window.setInterval(() => {
        if (Date.now() - kickoff > MATCH_START_REFRESH_WINDOW_MS) {
          if (intervalId) window.clearInterval(intervalId)
          return
        }

        refetchMatch()
      }, MATCH_START_REFRESH_INTERVAL_MS)
    }

    startPolling()

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId)
      if (intervalId) window.clearInterval(intervalId)
    }
  }, [groupId, match?.id, match?.scheduledAt, match?.status, refetchGroupMatches, refetchMatchDetail])

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
  // O status interno pode virar `live` pelo horário antes de a API-Football
  // sair de NS/TBD. `live.isLive` é a fonte canônica para o bloco ao vivo.
  const isLiveView = !!isLiveStatus && (live ? live.isLive : true)
  const isUpstreamScheduled = !!isLiveStatus && !!live && !live.isLive && !isUpstreamFinished
  const hasStartedView = isFinishedView || isLiveView
  const displayStatus = isUpstreamScheduled ? 'upcoming' : match.status

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
  const showLiveBlock = isLiveStatus && live && live.hasApiFixtureId && live.isLive
  // Pontos do usuário só existem em contexto de grupo (endpoint exige groupId) e
  // só fazem sentido com o jogo em andamento ou encerrado.
  const showPoints = !!groupId && !!matchId && (isLiveView || isFinishedView)
  const liveHomeTeamId = live?.teams?.home.id ?? null
  const liveStadiumName = live?.venue?.name ?? match.stadium?.name ?? null
  const liveStadiumCity = live?.venue?.city ?? match.stadium?.city ?? null
  const postStadiumName = postSource?.venueName ?? match.stadium?.name ?? null
  const postStadiumCity = postSource?.venueCity ?? match.stadium?.city ?? null
  // Aviso de prorrogação (só quando o jogo foi/está nela).
  const postExtraTimeNotice =
    showPostMatchBlock && postSource ? extraTimeNotice(postSource.statusShort) : null
  const liveExtraTimeNotice = showLiveBlock && live ? extraTimeNotice(live.status.short) : null

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Match header */}
      {showPostMatchBlock && postSource ? (
        <div className="space-y-1.5">
          <PostMatchScoreboard
            statusShort={postSource.statusShort}
            homeTeamName={match.homeTeam.name}
            homeTeamFlag={match.homeTeam.flagUrl}
            homeTeamFlagTeamId={match.homeTeam.id}
            homeWinner={postSource.homeWinner}
            homeGoals={postSource.goalsHome}
            awayTeamName={match.awayTeam.name}
            awayTeamFlag={match.awayTeam.flagUrl}
            awayTeamFlagTeamId={match.awayTeam.id}
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
          {postExtraTimeNotice ? <ExtraTimeNote>{postExtraTimeNotice}</ExtraTimeNote> : null}
        </div>
      ) : showLiveBlock ? (
        <div className="space-y-1.5">
          <LiveScoreboard
            live={live}
            homeTeamName={match.homeTeam.name}
            homeTeamFlag={match.homeTeam.flagUrl}
            homeTeamFlagTeamId={match.homeTeam.id}
            awayTeamName={match.awayTeam.name}
            awayTeamFlag={match.awayTeam.flagUrl}
            awayTeamFlagTeamId={match.awayTeam.id}
          />
          {liveStadiumName ? (
            <p className="pl-1 text-xs text-[var(--text-muted)]">
              {liveStadiumName}
              {liveStadiumCity ? `, ${liveStadiumCity}` : ''}
            </p>
          ) : null}
          {liveExtraTimeNotice ? <ExtraTimeNote>{liveExtraTimeNotice}</ExtraTimeNote> : null}
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="shrink-0">
            <TeamFlag
              name={match.homeTeam.name}
              flagUrl={match.homeTeam.flagUrl}
              teamId={match.homeTeam.id}
              size="lg"
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            {hasStartedView ? (
              <span className="text-3xl font-bold tracking-tight text-[var(--text)]">
                {match.homeScore} × {match.awayScore}
              </span>
            ) : (
              <span className="text-sm font-semibold text-[var(--text-muted)]">
                {formatCountdown(match.scheduledAt)}
              </span>
            )}
            <MatchStatusBadge status={displayStatus} />
            <span className="text-xs text-[var(--text-muted)]">{formatMatchDate(match.scheduledAt)}</span>
            {match.stadium && (
              <span className="text-xs text-[var(--text-muted)]">
                {match.stadium.name}, {match.stadium.city}
              </span>
            )}
          </div>

          <div className="shrink-0">
            <TeamFlag
              name={match.awayTeam.name}
              flagUrl={match.awayTeam.flagUrl}
              teamId={match.awayTeam.id}
              size="lg"
            />
          </div>
        </div>
      )}

      {showPoints ? (
        <div className="space-y-3">
          <div className="flex justify-center">
            <MatchPointsBadge
              matchId={matchId!}
              groupId={groupId!}
              status={match.status}
              userBet={match.userBet}
            />
          </div>
          <MatchPointsCard matchId={matchId!} groupId={groupId!} />
        </div>
      ) : match.userBet ? (
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-soft)] p-3 text-center">
          <p className="text-xs text-[var(--text-muted)]">Seu palpite</p>
          <p className="text-xl font-bold text-[var(--text)]">
            {match.userBet.homeScore} × {match.userBet.awayScore}
          </p>
        </div>
      ) : null}

      {/* Abas (contexto de grupo) — separa os detalhes da partida dos palpites */}
      {groupId ? (
        <div
          className="inline-flex rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] p-1"
          role="tablist"
          aria-label="Seções da partida"
        >
          <MatchTabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')}>
            Detalhes da partida
          </MatchTabButton>
          <MatchTabButton active={activeTab === 'bets'} onClick={() => setActiveTab('bets')}>
            Palpites
          </MatchTabButton>
        </div>
      ) : null}

      {/* Aba: Detalhes da partida (fora de grupo, sempre exibida) */}
      {!groupId || activeTab === 'details' ? (
        <div className="space-y-6">
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
          {distribution && user?.chartUnlocked && hasStartedView && (
            <DistributionChart
              data={distribution}
              homeTeamName={match.homeTeam.name}
              awayTeamName={match.awayTeam.name}
            />
          )}

          {/* Pre-match data (probability, recent form, lineups, injuries, venue) */}
          {isUpcomingStatus && preview ? (
            <div className="space-y-4">
              {preview.prediction ? (
                <PreMatchProbability
                  prediction={preview.prediction}
                  homeName={match.homeTeam.name}
                  awayName={match.awayTeam.name}
                />
              ) : null}

              <PreMatchRecentForm
                recentForm={preview.recentForm}
                homeTeam={{
                  id: match.homeTeam.id,
                  name: match.homeTeam.name,
                  flagUrl: match.homeTeam.flagUrl,
                }}
                awayTeam={{
                  id: match.awayTeam.id,
                  name: match.awayTeam.name,
                  flagUrl: match.awayTeam.flagUrl,
                }}
              />

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
        </div>
      ) : null}

      {/* Aba: Palpites (group context only) */}
      {groupId && activeTab === 'bets' ? (
        betsData ? (
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[var(--text)]">Apostas do bolão</h2>
            <BetsGrid
              bets={betsData.bets}
              canView={betsData.canView}
              groupInviteCode={activeGroup?.inviteCode}
            />
          </section>
        ) : (
          <div className="flex h-32 items-center justify-center text-sm text-[var(--text-muted)]">
            Carregando palpites…
          </div>
        )
      ) : null}
    </div>
  )
}

// Nota pequena em amarelo sob o card do resultado (prorrogação/pênaltis).
function ExtraTimeNote({ children }: { children: string }) {
  return (
    <div className="flex items-start gap-1.5 rounded-[var(--radius)] border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1.5 text-xs text-yellow-700">
      <span aria-hidden>⏱️</span>
      <span>{children}</span>
    </div>
  )
}

interface MatchTabButtonProps {
  active: boolean
  children: string
  onClick: () => void
}

function MatchTabButton({ active, children, onClick }: MatchTabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        'flex min-h-10 items-center rounded-[var(--radius-pill)] px-4 text-sm font-semibold transition',
        active
          ? 'bg-[var(--brand)] text-[var(--brand-text)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text)]',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
