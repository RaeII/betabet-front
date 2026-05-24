import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useBettingProgress } from '@/hooks/useBettingProgress'
import type { MatchdayGroup, MatchWithUserBet } from '@/types/match.types'

const baseTeam = { id: 't', name: 'T', flagUrl: '', group: null }
const baseStadium = { id: 's', name: 'X', city: 'C' }

function makeMatch(id: string, hasBet: boolean, status: MatchWithUserBet['status'] = 'upcoming'): MatchWithUserBet {
  return {
    id,
    homeTeam: baseTeam,
    awayTeam: baseTeam,
    stadium: baseStadium,
    scheduledAt: new Date().toISOString(),
    status,
    phase: 'group',
    groupName: null,
    matchday: null,
    homeScore: null,
    awayScore: null,
    userBet: hasBet
      ? { id: 'b', matchId: id, userId: 'u', groupId: 'g', homeScore: 0, awayScore: 0, resultPoints: null, exactScorePoints: null, createdAt: '', updatedAt: '' }
      : null,
  }
}

function makeDay(matches: MatchWithUserBet[]): MatchdayGroup {
  return { date: '2026-06-15', label: 'X', matches, isPast: false, isToday: true }
}

describe('useBettingProgress', () => {
  it('counts betted / total and computes pct + isComplete', () => {
    const days = [
      makeDay([
        makeMatch('m1', true),
        makeMatch('m2', false),
        makeMatch('m3', true),
        makeMatch('m4', false),
      ]),
    ]
    const { result } = renderHook(() => useBettingProgress(days))
    expect(result.current).toEqual({ betted: 2, total: 4, pct: 50, isComplete: false })
  })

  it('returns isComplete=false and pct=0 when total === 0', () => {
    const { result } = renderHook(() => useBettingProgress([]))
    expect(result.current).toEqual({ betted: 0, total: 0, pct: 0, isComplete: false })
  })

  it('returns isComplete=true when all matches have bets', () => {
    const days = [makeDay([makeMatch('m1', true), makeMatch('m2', true)])]
    const { result } = renderHook(() => useBettingProgress(days))
    expect(result.current.isComplete).toBe(true)
    expect(result.current.pct).toBe(100)
  })

  it('excludes finished matches from the denominator', () => {
    const days = [
      makeDay([
        makeMatch('m1', true),
        makeMatch('m2', false, 'finished'),
      ]),
    ]
    const { result } = renderHook(() => useBettingProgress(days))
    expect(result.current).toEqual({ betted: 1, total: 1, pct: 100, isComplete: true })
  })
})
