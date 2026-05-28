import type { MatchLive } from '@/services/liveMatch.service'
import { TeamFlag } from '@/components/match/TeamFlag'

interface LiveScoreboardProps {
  live: MatchLive
  homeTeamName: string
  homeTeamFlag: string
  awayTeamName: string
  awayTeamFlag: string
}

const STATUS_LABEL: Record<string, string> = {
  '1H': '1º tempo',
  HT: 'Intervalo',
  '2H': '2º tempo',
  ET: 'Prorrogação',
  BT: 'Intervalo prorrog.',
  P: 'Pênaltis',
  SUSP: 'Suspensa',
  INT: 'Interrompida',
  LIVE: 'Ao vivo',
  FT: 'Encerrada',
  AET: 'Após prorrog.',
  PEN: 'Após pênaltis',
}

function formatClock(elapsed: number | null, extra: number | null, short: string): string {
  if (short === 'HT') return 'INT'
  if (short === 'BT') return 'INT P'
  if (elapsed === null) return STATUS_LABEL[short] ?? short
  const base = `${elapsed}'`
  return extra ? `${base} +${extra}` : base
}

function formatGoalMinute(minute: number, extra: number | null): string {
  return extra ? `${minute}'+${extra}` : `${minute}'`
}

export function LiveScoreboard({
  live,
  homeTeamName,
  homeTeamFlag,
  awayTeamName,
  awayTeamFlag,
}: LiveScoreboardProps) {
  const homeScore = live.goals.home ?? 0
  const awayScore = live.goals.away ?? 0
  const statusLabel = STATUS_LABEL[live.status.short] ?? live.status.long
  const clock = formatClock(live.status.elapsed, live.status.extra, live.status.short)
  const homeTeamId = live.teams?.home.id ?? null
  const awayTeamId = live.teams?.away.id ?? null
  const goalEvents = live.events.filter((event) => event.type === 'Goal' && event.detail !== 'Missed Penalty')
  const homeGoals = goalEvents.filter((event) =>
    homeTeamId !== null ? event.teamId === homeTeamId : event.teamName === homeTeamName
  )
  const awayGoals = goalEvents.filter((event) =>
    awayTeamId !== null ? event.teamId === awayTeamId : event.teamName === awayTeamName
  )

  return (
    <section className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
      <header className="flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500"
          />
          {statusLabel}
        </span>
        {live.league?.round ? (
          <span className="truncate">{live.league.round}</span>
        ) : null}
      </header>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 flex-col items-center gap-2">
          <TeamFlag name={homeTeamName} flagUrl={homeTeamFlag} size="lg" />
          <span className="line-clamp-1 text-center text-xs font-semibold text-[var(--text)]">
            {homeTeamName}
          </span>
          {homeGoals.length > 0 ? (
            <ul className="w-full space-y-0.5 text-center text-[11px] text-[var(--text-muted)]">
              {homeGoals.map((event, index) => (
                <li key={`home-goal-${event.minute}-${event.extra ?? 0}-${event.player}-${index}`}>
                  <span aria-hidden="true">⚽</span> {event.player || 'Gol'}, {formatGoalMinute(event.minute, event.extra)}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-baseline gap-2 text-4xl font-bold tabular-nums tracking-tight text-[var(--text)]">
            <span>{homeScore}</span>
            <span className="text-[var(--text-muted)]">×</span>
            <span>{awayScore}</span>
          </div>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold tabular-nums text-emerald-600">
            {clock}
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center gap-2">
          <TeamFlag name={awayTeamName} flagUrl={awayTeamFlag} size="lg" />
          <span className="line-clamp-1 text-center text-xs font-semibold text-[var(--text)]">
            {awayTeamName}
          </span>
          {awayGoals.length > 0 ? (
            <ul className="w-full space-y-0.5 text-center text-[11px] text-[var(--text-muted)]">
              {awayGoals.map((event, index) => (
                <li key={`away-goal-${event.minute}-${event.extra ?? 0}-${event.player}-${index}`}>
                  <span aria-hidden="true">⚽</span> {event.player || 'Gol'}, {formatGoalMinute(event.minute, event.extra)}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

    </section>
  )
}
