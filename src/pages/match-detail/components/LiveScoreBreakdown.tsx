import type { MatchLive } from '@/services/liveMatch.service'

interface LiveScoreBreakdownProps {
  live: MatchLive
  homeName: string
  awayName: string
}

interface Segment {
  label: string
  home: number | null
  away: number | null
}

function hasValue(seg: Segment): boolean {
  return seg.home !== null || seg.away !== null
}

export function LiveScoreBreakdown({ live, homeName, awayName }: LiveScoreBreakdownProps) {
  const segments: Segment[] = [
    { label: '1T', home: live.score.halftime.home, away: live.score.halftime.away },
    { label: '2T', home: live.score.fulltime.home, away: live.score.fulltime.away },
    { label: 'Prorr', home: live.score.extratime.home, away: live.score.extratime.away },
    { label: 'Pên', home: live.score.penalty.home, away: live.score.penalty.away },
  ]
  const visible = segments.filter(hasValue)
  if (visible.length === 0) return null

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <header className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        Quebra de placar
      </header>
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-y-2 text-sm">
        <span className="truncate text-xs font-semibold text-[var(--text)]">{homeName}</span>
        <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
          {visible.map(s => (
            <span key={s.label} className="rounded bg-[var(--surface-soft)] px-1.5 py-0.5 font-semibold">
              {s.label}
            </span>
          ))}
        </div>
        <span className="truncate text-right text-xs font-semibold text-[var(--text)]">{awayName}</span>

        <span className="text-lg font-bold tabular-nums text-[var(--text)]">
          {visible.map(s => s.home ?? '-').join(' · ')}
        </span>
        <span className="text-center text-xs text-[var(--text-muted)]">×</span>
        <span className="text-right text-lg font-bold tabular-nums text-[var(--text)]">
          {visible.map(s => s.away ?? '-').join(' · ')}
        </span>
      </div>
    </section>
  )
}
