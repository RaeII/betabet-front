import { useEffect, useMemo, useState } from 'react'
import { MatchCard } from '@/components/match/MatchCard'
import { cn } from '@/lib/utils'
import type { Match, MatchesResponse } from '@/types/match.types'

interface GroupStageGridProps {
  data: MatchesResponse['groupStage']
  groupId?: string
}

interface MatchdayOption {
  value: string
  label: string
  matches: Match[]
}

function getMatchdayNumber(value: string): number | null {
  const match = value.match(/\d+/)
  return match ? Number(match[0]) : null
}

function getMatchdayLabel(value: string): string {
  return getMatchdayNumber(value)?.toString() ?? value
}

function sortMatchdays(a: string, b: string) {
  const aNumber = getMatchdayNumber(a)
  const bNumber = getMatchdayNumber(b)
  if (aNumber !== null && bNumber !== null) return aNumber - bNumber
  return a.localeCompare(b)
}

function getMatchdayOptions(data: MatchesResponse['groupStage']): MatchdayOption[] {
  const matchdays = new Map<string, Match[]>()

  Object.values(data).forEach(groupMatchdays => {
    Object.entries(groupMatchdays).forEach(([matchday, matches]) => {
      matchdays.set(matchday, [...(matchdays.get(matchday) ?? []), ...(matches as Match[])])
    })
  })

  return [...matchdays.entries()]
    .sort(([a], [b]) => sortMatchdays(a, b))
    .map(([value, matches]) => ({ value, label: getMatchdayLabel(value), matches }))
}

function findCurrentMatchday(options: MatchdayOption[]): string | null {
  const live = options.find(option => option.matches.some(match => match.status === 'live'))
  if (live) return live.value

  const now = Date.now()
  const next = options
    .flatMap(option =>
      option.matches.map(match => ({
        matchday: option.value,
        time: new Date(match.scheduledAt).getTime(),
      })),
    )
    .filter(match => match.time >= now)
    .sort((a, b) => a.time - b.time)[0]
  if (next) return next.matchday

  const previous = options
    .flatMap(option =>
      option.matches.map(match => ({
        matchday: option.value,
        time: new Date(match.scheduledAt).getTime(),
      })),
    )
    .filter(match => match.time < now)
    .sort((a, b) => b.time - a.time)[0]

  return previous?.matchday ?? options[0]?.value ?? null
}

export function GroupStageGrid({ data, groupId }: GroupStageGridProps) {
  const groups = Object.entries(data).sort(([a], [b]) => a.localeCompare(b))
  const matchdayOptions = useMemo(() => getMatchdayOptions(data), [data])
  const currentMatchday = useMemo(() => findCurrentMatchday(matchdayOptions), [matchdayOptions])
  const [selectedMatchday, setSelectedMatchday] = useState<string | null>(null)

  useEffect(() => {
    setSelectedMatchday(previous => {
      if (previous && matchdayOptions.some(option => option.value === previous)) return previous
      return currentMatchday
    })
  }, [currentMatchday, matchdayOptions])

  if (groups.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-[var(--text-muted)]">
        Nenhuma partida encontrada.
      </p>
    )
  }

  const activeMatchday = selectedMatchday ?? currentMatchday ?? matchdayOptions[0]?.value ?? ''
  const activeMatchdayLabel = getMatchdayLabel(activeMatchday)
  const selectedGroups = groups
    .map(([groupLetter, matchdays]) => ({
      groupLetter,
      matches: [...((matchdays[activeMatchday] as Match[] | undefined) ?? [])].sort(
        (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      ),
    }))
    .filter(group => group.matches.length > 0)

  return (
    <div className="space-y-8">
      <div className="overflow-x-auto pb-1">
        <div
          className="flex min-w-max gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] p-1"
          role="tablist"
          aria-label="Rodadas da fase de grupos"
        >
          {matchdayOptions.map(option => {
            const isActive = option.value === activeMatchday
            const isCurrent = option.value === currentMatchday

            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-current={isCurrent ? 'step' : undefined}
                onClick={() => setSelectedMatchday(option.value)}
                className={cn(
                  'flex min-h-11 min-w-32 items-center justify-center gap-2 rounded-[var(--radius-pill)] px-4 text-sm font-semibold transition duration-150 focus:outline focus:outline-2 focus:outline-offset-[3px] focus:outline-[var(--brand)]',
                  isActive
                    ? 'bg-[var(--brand)] text-[var(--brand-text)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]',
                )}
              >
                <span>Rodada {option.label}</span>
                {isCurrent ? (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]',
                      isActive
                        ? 'bg-[var(--brand-text)]/15 text-[var(--brand-text)]'
                        : 'bg-[var(--surface-soft)] text-[var(--brand)]',
                    )}
                  >
                    Atual
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {selectedGroups.map(({ groupLetter, matches }) => {
        return (
          <section key={groupLetter} className="space-y-4">
            <header className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-[var(--brand-text)]">
                  {groupLetter}
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-[var(--text)]">Grupo {groupLetter}</h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    {matches.length} {matches.length === 1 ? 'partida' : 'partidas'} na rodada{' '}
                    {activeMatchdayLabel}
                  </p>
                </div>
              </div>
            </header>

            <div className="space-y-3">
              {matches.map(match => (
                <MatchCard key={match.id} match={match} groupId={groupId} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
