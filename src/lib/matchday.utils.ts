import type { MatchWithUserBet, MatchdayGroup } from '@/types/match.types'

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatLabel(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

export function groupMatchesByDay(
  matches: MatchWithUserBet[],
  options: { includePast?: boolean } = {},
): MatchdayGroup[] {
  const { includePast = false } = options
  const now = new Date()
  const todayKey = toLocalDateKey(now)

  const buckets = new Map<string, MatchWithUserBet[]>()
  for (const match of matches) {
    const d = new Date(match.scheduledAt)
    const key = toLocalDateKey(d)
    const list = buckets.get(key)
    if (list) list.push(match)
    else buckets.set(key, [match])
  }

  const groups: MatchdayGroup[] = []
  for (const [key, bucketMatches] of buckets) {
    const sorted = bucketMatches
      .slice()
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      )
    const allPast = sorted.every(
      m =>
        m.status === 'finished' ||
        new Date(m.scheduledAt).getTime() < now.getTime(),
    )
    const date = new Date(`${key}T00:00:00`)
    groups.push({
      date: key,
      label: formatLabel(date),
      matches: sorted,
      isPast: allPast,
      isToday: key === todayKey,
    })
  }

  groups.sort((a, b) => a.date.localeCompare(b.date))

  if (!includePast) {
    return groups.filter(g => !g.isPast)
  }
  return groups
}

export function findDefaultMatchday(matchdays: MatchdayGroup[]): number {
  if (matchdays.length === 0) return 0
  const now = new Date()
  const todayKey = toLocalDateKey(now)

  const todayIndex = matchdays.findIndex(m => m.date === todayKey)
  if (todayIndex >= 0) return todayIndex

  const upcomingIndex = matchdays.findIndex(m => m.date > todayKey)
  if (upcomingIndex >= 0) return upcomingIndex

  return 0
}

export function isPastDay(matchday: MatchdayGroup, now: Date = new Date()): boolean {
  return matchday.matches.every(
    m =>
      m.status === 'finished' ||
      new Date(m.scheduledAt).getTime() < now.getTime(),
  )
}
