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
  /** ISO do 1º jogo da fase de grupos; `null` se ainda não houver jogos. */
  deadline: string | null
  bettingOpen: boolean
  /** Campeão global, se o admin já definiu. */
  championTeamId: string | null
  myBet: ChampionBet | null
}

export interface ChampionBetInput {
  firstTeamId: number
  secondTeamId: number
}
