import { apiGet } from './api'
import type { WorldCupStandingsResponse } from '@/types/worldCup.types'

export function getWorldCupStandings(): Promise<WorldCupStandingsResponse> {
  return apiGet('/api/api-football/world-cup/standings')
}
