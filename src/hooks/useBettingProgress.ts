import { useMemo } from 'react'
import type { BettingProgress, MatchdayGroup } from '@/types/match.types'

export function useBettingProgress(matchdays: MatchdayGroup[]): BettingProgress {
  return useMemo(() => {
    let total = 0
    let betted = 0
    for (const day of matchdays) {
      for (const match of day.matches) {
        if (match.status === 'finished') continue
        total += 1
        if (match.userBet !== null) betted += 1
      }
    }
    const pct = total === 0 ? 0 : Math.round((betted / total) * 100)
    return {
      betted,
      total,
      pct,
      isComplete: total > 0 && betted === total,
    }
  }, [matchdays])
}
