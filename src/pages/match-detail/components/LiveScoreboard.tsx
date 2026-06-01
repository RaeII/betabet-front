import type { LiveEvent, MatchLive } from '@/services/liveMatch.service'
import { TeamFlagImage } from '@/components/match/TeamFlagImage'

interface LiveScoreboardProps {
  live: MatchLive
  homeTeamName: string
  homeTeamFlag: string
  homeTeamFlagTeamId?: string | number | null
  awayTeamName: string
  awayTeamFlag: string
  awayTeamFlagTeamId?: string | number | null
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

// Em gol contra, sufixa "(C)" no nome do jogador para indicar que foi contra.
function goalScorerLabel(event: LiveEvent): string {
  const name = event.player || 'Gol'
  return event.detail === 'Own Goal' ? `${name} (C)` : name
}

function TeamScoreIdentity({
  name,
  flagUrl,
  flagTeamId,
}: {
  name: string
  flagUrl: string
  flagTeamId?: string | number | null
}) {
  return (
    <div className="flex h-[76px] min-w-0 flex-col items-center justify-start gap-2">
      <div className="flex h-12 w-16 shrink-0 items-center justify-center">
        <TeamFlagImage
          src={flagUrl}
          teamId={flagTeamId}
          alt={`Bandeira ${name}`}
          className="max-h-full max-w-full rounded object-contain shadow-sm"
        />
      </div>
      <span className="line-clamp-1 min-h-4 max-w-full text-center text-xs font-semibold leading-4 text-[var(--text)]">
        {name}
      </span>
    </div>
  )
}

export function LiveScoreboard({
  live,
  homeTeamName,
  homeTeamFlag,
  homeTeamFlagTeamId,
  awayTeamName,
  awayTeamFlag,
  awayTeamFlagTeamId,
}: LiveScoreboardProps) {
  const homeScore = live.goals.home ?? 0
  const awayScore = live.goals.away ?? 0
  const statusLabel = STATUS_LABEL[live.status.short] ?? live.status.long
  const clock = formatClock(live.status.elapsed, live.status.extra, live.status.short)
  const homeTeamId = live.teams?.home.id ?? null
  const awayTeamId = live.teams?.away.id ?? null
  const goalEvents = live.events.filter((event) => event.type === 'Goal' && event.detail !== 'Missed Penalty')
  // Gol (inclusive contra) fica no lado do time do jogador que marcou.
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
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-x-2 gap-y-3">
        <TeamScoreIdentity
          name={homeTeamName}
          flagUrl={homeTeamFlag}
          flagTeamId={homeTeamFlagTeamId}
        />

        <div className="flex h-[76px] flex-col items-center justify-center gap-1">
          <div className="flex items-baseline gap-2 text-4xl font-bold tabular-nums tracking-tight text-[var(--text)]">
            <span>{homeScore}</span>
            <span className="text-[var(--text-muted)]">×</span>
            <span>{awayScore}</span>
          </div>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold tabular-nums text-emerald-600">
            {clock}
          </span>
        </div>

        <TeamScoreIdentity
          name={awayTeamName}
          flagUrl={awayTeamFlag}
          flagTeamId={awayTeamFlagTeamId}
        />

        {homeGoals.length > 0 || awayGoals.length > 0 ? (
          <>
          <ul className="min-h-0 space-y-0.5 text-center text-[11px] text-[var(--text-muted)]">
            {homeGoals.map((event, index) => (
              <li key={`home-goal-${event.minute}-${event.extra ?? 0}-${event.player}-${index}`}>
                <span aria-hidden="true">⚽</span> {goalScorerLabel(event)}, {formatGoalMinute(event.minute, event.extra)}
              </li>
            ))}
          </ul>

          <div aria-hidden="true" />

          <ul className="min-h-0 space-y-0.5 text-center text-[11px] text-[var(--text-muted)]">
            {awayGoals.map((event, index) => (
              <li key={`away-goal-${event.minute}-${event.extra ?? 0}-${event.player}-${index}`}>
                <span aria-hidden="true">⚽</span> {goalScorerLabel(event)}, {formatGoalMinute(event.minute, event.extra)}
              </li>
            ))}
          </ul>
          </>
        ) : null}
      </div>

    </section>
  )
}
