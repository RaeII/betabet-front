import { useState } from 'react'
import type { LiveEvent } from '@/services/liveMatch.service'

interface LiveEventsTimelineProps {
  events: LiveEvent[]
  homeTeamId: number | null
}

interface EventVisual {
  icon: string
  label: string
  tone: 'goal' | 'yellow' | 'red' | 'sub' | 'var' | 'default'
}

function classify(event: LiveEvent): EventVisual {
  const type = event.type
  const detail = event.detail
  if (type === 'Goal') {
    if (detail === 'Own Goal') return { icon: '⚽', label: 'Gol contra', tone: 'goal' }
    if (detail === 'Missed Penalty') return { icon: '✗', label: 'Pênalti perdido', tone: 'default' }
    if (detail === 'Penalty') return { icon: '⚽', label: 'Gol de pênalti', tone: 'goal' }
    return { icon: '⚽', label: 'Gol', tone: 'goal' }
  }
  if (type === 'Card') {
    if (detail === 'Red Card') return { icon: '🟥', label: 'Cartão vermelho', tone: 'red' }
    if (detail === 'Second Yellow card') return { icon: '🟥', label: '2º amarelo', tone: 'red' }
    return { icon: '🟨', label: 'Cartão amarelo', tone: 'yellow' }
  }
  if (type === 'subst') return { icon: '⇄', label: 'Substituição', tone: 'sub' }
  if (type === 'Var') return { icon: '📺', label: `VAR · ${detail}`, tone: 'var' }
  return { icon: '•', label: detail, tone: 'default' }
}

const TONE_CLASS: Record<EventVisual['tone'], string> = {
  goal: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  yellow: 'bg-yellow-400/20 text-yellow-700 border-yellow-500/30',
  red: 'bg-red-500/15 text-red-700 border-red-500/40',
  sub: 'bg-sky-500/15 text-sky-700 border-sky-500/30',
  var: 'bg-purple-500/15 text-purple-700 border-purple-500/30',
  default: 'bg-[var(--surface-soft)] text-[var(--text)] border-[var(--border)]',
}

function formatMinute(e: LiveEvent): string {
  return e.extra ? `${e.minute}'+${e.extra}` : `${e.minute}'`
}

export function LiveEventsTimeline({ events, homeTeamId }: LiveEventsTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (events.length === 0) {
    return null
  }

  // mostrar do mais recente para o mais antigo
  const ordered = [...events].reverse()
  const visibleEvents = isExpanded ? ordered : ordered.slice(0, 15)
  const hasMoreThanLimit = ordered.length > 15

  return (
    <section className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <header className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        Timeline ({events.length})
      </header>

      <ol className="space-y-2">
        {visibleEvents.map((e, idx) => {
          const visual = classify(e)
          const isHome = homeTeamId !== null && e.teamId === homeTeamId
          return (
            <li
              key={`${e.minute}-${e.extra ?? 0}-${idx}`}
              className={`flex items-center gap-3 ${isHome ? '' : 'flex-row-reverse'}`}
            >
              <span
                className={`inline-flex w-12 shrink-0 justify-center rounded-full border px-2 py-1 text-[11px] font-bold tabular-nums ${TONE_CLASS[visual.tone]}`}
              >
                {formatMinute(e)}
              </span>
              <div className={`min-w-0 flex-1 ${isHome ? 'text-left' : 'text-right'}`}>
                <p
                  className={`flex items-center gap-1.5 text-sm font-semibold text-[var(--text)] ${
                    isHome ? '' : 'justify-end'
                  }`}
                >
                  <span aria-hidden="true">{visual.icon}</span>
                  <span className="truncate">{e.player || visual.label}</span>
                </p>
                <p className="truncate text-xs text-[var(--text-muted)]">
                  {visual.label}
                  {e.type === 'Goal' && e.assist ? ` · assist ${e.assist}` : ''}
                  {e.type === 'subst' && e.assist ? ` · sai ${e.assist}` : ''}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
      {hasMoreThanLimit ? (
        <button
          type="button"
          onClick={() => setIsExpanded((curr) => !curr)}
          className="text-xs font-medium text-[var(--text-muted)] underline underline-offset-2 transition hover:text-[var(--text)]"
        >
          {isExpanded ? 'Mostrar apenas últimos 15 status' : 'Expandir e ver todos os status'}
        </button>
      ) : null}
    </section>
  )
}
