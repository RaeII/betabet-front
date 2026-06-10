import { apiGet } from './api'
import type { DistributionData, Match, MatchesResponse, MatchWithUserBet } from '@/types/match.types'

interface MatchDistributionResponse {
  distribution: {
    matchId: string
    totalBets: number
    homePercent: number
    drawPercent: number
    awayPercent: number
  }
}

export function getMatches(): Promise<MatchesResponse> {
  return apiGet('/api/matches')
}

export function getMatch(matchId: string): Promise<MatchWithUserBet> {
  return apiGet(`/api/matches/${matchId}`)
}

export async function getMatchDistribution(matchId: string): Promise<DistributionData> {
  const { distribution } = await apiGet<MatchDistributionResponse>(`/api/matches/${matchId}/distribution`)

  return {
    matchId: distribution.matchId,
    totalBets: distribution.totalBets,
    homePct: distribution.homePercent,
    drawPct: distribution.drawPercent,
    awayPct: distribution.awayPercent,
  }
}

export function getAllMatches(): Promise<Match[]> {
  return getMatches().then((res) => {
    const group = Object.values(res.groupStage).flatMap((days) =>
      Object.values(days).flat(),
    )
    const knockout = Object.values(res.knockout).flat()
    return [...group, ...knockout]
  })
}
