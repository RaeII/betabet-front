import type { LiveEvent, LiveScoreSplit } from '@/services/liveMatch.service'
import { TeamFlagImage } from '@/components/match/TeamFlagImage'

interface PostMatchScoreboardProps {
  statusShort: string
  homeTeamName: string
  homeTeamFlag: string
  homeTeamFlagTeamId?: string | number | null
  homeWinner: boolean | null
  homeGoals: number | null
  awayTeamName: string
  awayTeamFlag: string
  awayTeamFlagTeamId?: string | number | null
  awayWinner: boolean | null
  awayGoals: number | null
  round: string | null
  score: {
    halftime: LiveScoreSplit
    fulltime: LiveScoreSplit
    extratime: LiveScoreSplit
    penalty: LiveScoreSplit
  }
  events: LiveEvent[]
  homeTeamId: number | null
  awayTeamId: number | null
}

const STATUS_LABEL: Record<string, string> = {
  FT: 'Encerrada',
  AET: 'Após prorrog.',
  PEN: 'Após pênaltis',
}

function formatGoalMinute(minute: number, extra: number | null): string {
  return extra ? `${minute}'+${extra}` : `${minute}'`
}

interface Segment {
  label: string
  home: number | null
  away: number | null
}

function buildSegments(score: PostMatchScoreboardProps['score']): Segment[] {
  return [
    { label: '1T', home: score.halftime.home, away: score.halftime.away },
    { label: '2T', home: score.fulltime.home, away: score.fulltime.away },
    { label: 'Prorr', home: score.extratime.home, away: score.extratime.away },
    { label: 'Pên', home: score.penalty.home, away: score.penalty.away },
  ].filter((s) => s.home !== null || s.away !== null)
}

function TeamScoreIdentity({
  name,
  flagUrl,
  flagTeamId,
  isWinner,
}: {
  name: string
  flagUrl: string
  flagTeamId?: string | number | null
  isWinner: boolean
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
      <span
        className={`line-clamp-1 min-h-4 max-w-full text-center text-xs leading-4 ${
          isWinner
            ? 'font-bold text-[var(--text)]'
            : 'font-semibold text-[var(--text-muted)]'
        }`}
      >
        {isWinner ? '✓ ' : ''}
        {name}
      </span>
    </div>
  )
}

export function PostMatchScoreboard({
  statusShort,
  homeTeamName,
  homeTeamFlag,
  homeTeamFlagTeamId,
  homeWinner,
  homeGoals,
  awayTeamName,
  awayTeamFlag,
  awayTeamFlagTeamId,
  awayWinner,
  awayGoals,
  round,
  score,
  events,
  homeTeamId,
  awayTeamId,
}: PostMatchScoreboardProps) {
  const statusLabel = STATUS_LABEL[statusShort] ?? statusShort
  const goalEvents = events.filter((event) => event.type === 'Goal' && event.detail !== 'Missed Penalty')
  const homeGoalsList = goalEvents.filter((event) =>
    homeTeamId !== null ? event.teamId === homeTeamId : event.teamName === homeTeamName
  )
  const awayGoalsList = goalEvents.filter((event) =>
    awayTeamId !== null ? event.teamId === awayTeamId : event.teamName === awayTeamName
  )
  const segments = buildSegments(score)

  return (
    <section className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
      <header className="flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full bg-[var(--text-muted)]"
          />
          {statusLabel}
        </span>
        {round ? <span className="truncate">{round}</span> : null}
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-x-2 gap-y-3">
        <TeamScoreIdentity
          name={homeTeamName}
          flagUrl={homeTeamFlag}
          flagTeamId={homeTeamFlagTeamId}
          isWinner={homeWinner === true}
        />

        <div className="flex h-[76px] flex-col items-center justify-center gap-1">
          <div className="flex items-baseline gap-2 text-4xl font-bold tabular-nums tracking-tight text-[var(--text)]">
            <span>{homeGoals ?? 0}</span>
            <span className="text-[var(--text-muted)]">×</span>
            <span>{awayGoals ?? 0}</span>
          </div>
          <span className="rounded-full bg-[var(--surface-soft)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Final
          </span>
        </div>

        <TeamScoreIdentity
          name={awayTeamName}
          flagUrl={awayTeamFlag}
          flagTeamId={awayTeamFlagTeamId}
          isWinner={awayWinner === true}
        />

        {homeGoalsList.length > 0 || awayGoalsList.length > 0 ? (
          <>
            <ul className="min-h-0 space-y-0.5 text-center text-[11px] text-[var(--text-muted)]">
              {homeGoalsList.map((event, index) => (
                <li key={`home-goal-${event.minute}-${event.extra ?? 0}-${event.player}-${index}`}>
                  <span aria-hidden="true">⚽</span> {event.player || 'Gol'}, {formatGoalMinute(event.minute, event.extra)}
                </li>
              ))}
            </ul>

            <div aria-hidden="true" />

            <ul className="min-h-0 space-y-0.5 text-center text-[11px] text-[var(--text-muted)]">
              {awayGoalsList.map((event, index) => (
                <li key={`away-goal-${event.minute}-${event.extra ?? 0}-${event.player}-${index}`}>
                  <span aria-hidden="true">⚽</span> {event.player || 'Gol'}, {formatGoalMinute(event.minute, event.extra)}
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      {segments.length > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-[var(--border)] pt-3 text-[11px] text-[var(--text-muted)]">
          {segments.map((s) => (
            <span
              key={s.label}
              className="rounded bg-[var(--surface-soft)] px-2 py-0.5 font-semibold tabular-nums"
            >
              {s.label} {s.home ?? '-'} × {s.away ?? '-'}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  )
}
