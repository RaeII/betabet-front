import { apiGet, apiPut } from './api'
import type {
  ChampionBetInput,
  ChampionBetState,
  ChampionDistribution,
} from '@/types/champion-bet.types'

export function getChampionBet(groupId: string): Promise<ChampionBetState> {
  return apiGet(`/api/groups/${groupId}/champion-bet`)
}

export function upsertChampionBet(
  groupId: string,
  data: ChampionBetInput,
): Promise<ChampionBetState> {
  return apiPut(`/api/groups/${groupId}/champion-bet`, data)
}

/** Distribuição global: o que todos os usuários do app apostam para campeão. */
export function getChampionDistribution(): Promise<ChampionDistribution> {
  return apiGet('/api/champion-bet/distribution')
}
