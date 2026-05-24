import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { groupMatchesByDay, findDefaultMatchday, isPastDay } from '@/lib/matchday.utils'
import type { MatchWithUserBet } from '@/types/match.types'

const baseTeam = { id: 't', name: 'T', flagUrl: '', group: null }
const baseStadium = { id: 's', name: 'S', city: 'C' }

function makeMatch(
  overrides: Partial<MatchWithUserBet> & { scheduledAt: string },
): MatchWithUserBet {
  return {
    id: overrides.id ?? `m-${overrides.scheduledAt}`,
    homeTeam: baseTeam,
    awayTeam: baseTeam,
    stadium: baseStadium,
    status: overrides.status ?? 'upcoming',
    phase: 'group',
    groupName: null,
    matchday: null,
    homeScore: null,
    awayScore: null,
    userBet: null,
    scheduledAt: overrides.scheduledAt,
  }
}

describe('groupMatchesByDay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00'))
  })

  afterEach(() => vi.useRealTimers())

  it('groups by local yyyy-mm-dd and orders chronologically', () => {
    const matches = [
      makeMatch({ scheduledAt: '2026-06-16T18:00:00' }),
      makeMatch({ scheduledAt: '2026-06-15T16:00:00' }),
      makeMatch({ scheduledAt: '2026-06-15T20:00:00' }),
    ]
    const groups = groupMatchesByDay(matches)
    expect(groups.map(g => g.date)).toEqual(['2026-06-15', '2026-06-16'])
    expect(groups[0].matches[0].scheduledAt).toBe('2026-06-15T16:00:00')
    expect(groups[0].matches[1].scheduledAt).toBe('2026-06-15T20:00:00')
  })

  it('filters past-only days by default; includes them when opt-in', () => {
    const matches = [
      makeMatch({ scheduledAt: '2026-06-10T18:00:00', status: 'finished' }),
      makeMatch({ scheduledAt: '2026-06-20T18:00:00' }),
    ]
    const future = groupMatchesByDay(matches)
    expect(future.map(g => g.date)).toEqual(['2026-06-20'])

    const all = groupMatchesByDay(matches, { includePast: true })
    expect(all.map(g => g.date)).toEqual(['2026-06-10', '2026-06-20'])
    expect(all[0].isPast).toBe(true)
  })

  it('marks isToday for the current local day', () => {
    const matches = [makeMatch({ scheduledAt: '2026-06-15T22:00:00' })]
    const groups = groupMatchesByDay(matches)
    expect(groups[0].isToday).toBe(true)
  })
})

describe('findDefaultMatchday', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00'))
  })
  afterEach(() => vi.useRealTimers())

  it('returns index of today when present', () => {
    const days = groupMatchesByDay([
      makeMatch({ scheduledAt: '2026-06-15T18:00:00' }),
      makeMatch({ scheduledAt: '2026-06-16T18:00:00' }),
    ])
    expect(findDefaultMatchday(days)).toBe(0)
  })

  it('falls back to first upcoming day when no today', () => {
    const days = groupMatchesByDay([
      makeMatch({ scheduledAt: '2026-06-17T18:00:00' }),
      makeMatch({ scheduledAt: '2026-06-20T18:00:00' }),
    ])
    expect(findDefaultMatchday(days)).toBe(0)
  })

  it('falls back to 0 when only past days', () => {
    const days = groupMatchesByDay(
      [
        makeMatch({ scheduledAt: '2026-06-10T18:00:00', status: 'finished' }),
        makeMatch({ scheduledAt: '2026-06-11T18:00:00', status: 'finished' }),
      ],
      { includePast: true },
    )
    expect(findDefaultMatchday(days)).toBe(0)
  })
})

describe('isPastDay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00'))
  })
  afterEach(() => vi.useRealTimers())

  it('returns true when every match is finished', () => {
    const days = groupMatchesByDay(
      [
        makeMatch({ scheduledAt: '2026-06-15T08:00:00', status: 'finished' }),
        makeMatch({ scheduledAt: '2026-06-15T10:00:00', status: 'finished' }),
      ],
      { includePast: true },
    )
    expect(isPastDay(days[0])).toBe(true)
  })

  it('returns false when at least one match is upcoming', () => {
    const days = groupMatchesByDay([
      makeMatch({ scheduledAt: '2026-06-15T22:00:00' }),
    ])
    expect(isPastDay(days[0])).toBe(false)
  })
})
