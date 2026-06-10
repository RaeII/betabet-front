import type { BetOutcome } from '@/types/bet.types'
import type { BettingGroup } from '@/types/group.types'
import type { Match } from '@/types/match.types'

export function deriveBetOutcome(homeScore: number, awayScore: number): BetOutcome {
  if (homeScore > awayScore) return 'home'
  if (homeScore < awayScore) return 'away'
  return 'draw'
}

export function calcPoints(
  betHome: number,
  betAway: number,
  matchHome: number,
  matchAway: number,
  group: Pick<BettingGroup, 'resultPoints' | 'exactScorePoints'>,
): number {
  const betOutcome = deriveBetOutcome(betHome, betAway)
  const actualOutcome = deriveBetOutcome(matchHome, matchAway)

  // Placar exato e acerto de resultado NÃO acumulam: o placar exato pontua só
  // exactScorePoints (tier mais alto), não soma com resultPoints.
  if (betHome === matchHome && betAway === matchAway) {
    return group.exactScorePoints
  }
  if (betOutcome === actualOutcome) {
    return group.resultPoints
  }
  return 0
}

export function matchHasResult(match: Match): boolean {
  return match.homeScore !== null && match.awayScore !== null
}
