import { apiGet } from './api'
import type { DistributionData, Match, MatchesResponse, MatchWithUserBet } from '@/types/match.types'

export function getMatches(): Promise<MatchesResponse> {
  return apiGet('/api/matches')
}

export function getMatch(matchId: string): Promise<MatchWithUserBet> {
  return apiGet(`/api/matches/${matchId}`)
}

export function getMatchDistribution(matchId: string): Promise<DistributionData> {
  return apiGet(`/api/matches/${matchId}/distribution`)
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
