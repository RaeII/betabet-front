import type { Team } from './match.types'

export interface ChampionBet {
  /** `null` quando o membro apostou só na opção 2 (após o fim da 1ª rodada). */
  firstTeamId: string | null
  secondTeamId: string
  /** Pontos atribuídos após o admin definir o campeão; `null` antes de liquidar. */
  points: number | null
  createdAt: string
  updatedAt: string
}

/** Estado completo da modalidade "campeão" para um membro do grupo. */
export interface ChampionBetState {
  enabled: boolean
  firstPoints: number
  secondPoints: number
  /** Prazo geral (== `secondDeadline`); mantido por compatibilidade. */
  deadline: string | null
  /** ISO do prazo do 1º palpite: fim da 1ª rodada da fase de grupos + 2h. */
  firstDeadline: string | null
  /** ISO do prazo do 2º palpite: fim da fase de grupos (rodada 3) + 2h. */
  secondDeadline: string | null
  /** 1º palpite ainda pode ser alterado (antes de `firstDeadline`). */
  firstOpen: boolean
  /** 2º palpite ainda pode ser alterado (antes de `secondDeadline`). */
  secondOpen: boolean
  bettingOpen: boolean
  /** Campeão global, se o admin já definiu. */
  championTeamId: string | null
  myBet: ChampionBet | null
}

export interface ChampionBetInput {
  /** `null` para apostar só na opção 2 (1ª rodada encerrada). */
  firstTeamId: number | null
  secondTeamId: number
}

/** Uma seleção na distribuição global, com quantas vezes foi escolhida. */
export interface ChampionDistributionEntry {
  team: Team
  /** Nº de vezes que a seleção foi escolhida (1º + 2º palpite somados). */
  votes: number
  /** Percentual sobre o total de palpites (0–100). */
  percent: number
}

/**
 * Distribuição global dos palpites de campeão (todos os usuários do app). Os dois
 * palpites contam como aposta na seleção campeã e são somados num total único,
 * já ordenado da seleção mais escolhida para a menos.
 */
export interface ChampionDistribution {
  totalBets: number
  entries: ChampionDistributionEntry[]
}
