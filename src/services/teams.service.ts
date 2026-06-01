import { apiGet } from './api'
import type { Team } from '@/types/match.types'

/** Lista de seleções (seletor de campeão na aposta de campeão). */
export function getTeams(): Promise<{ teams: Team[] }> {
  return apiGet('/api/teams')
}
