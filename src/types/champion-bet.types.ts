export interface ChampionBet {
  firstTeamId: string
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
  firstTeamId: number
  secondTeamId: number
}
