import { apiGet } from './api'

/**
 * Pontos do usuário numa partida — antes (`scheduled`), durante (`live`,
 * provisórios) e depois (`finished`, definitivos quando `confirmed=true`).
 * Espelha o `MatchMyPointsDTO` do backend (doc `011-match-my-points.md`).
 */
export type MatchPointsState = 'scheduled' | 'live' | 'finished'

export interface MatchMyPoints {
  matchId: string
  groupId: string
  groupName: string
  state: MatchPointsState
  /** Placar usado no cálculo (ao vivo ou terminal). `null` antes do jogo. */
  liveScore: { home: number | null; away: number | null } | null
  /** Palpite do usuário. `null` se não apostou. */
  bet: { homeScore: number; awayScore: number } | null
  matchPoints: {
    /** Pontos por acerto de vencedor/empate. */
    result: number
    /** Pontos por placar exato. */
    exactScore: number
    /** result + exactScore. */
    total: number
    /** `true` quando já liquidado no banco (definitivo). */
    confirmed: boolean
  }
  /** Total confirmado no grupo, EXCLUINDO esta partida. */
  totalBeforeMatch: number
  /** totalBeforeMatch + matchPoints.total. */
  totalWithMatch: number
}

export function getMatchMyPoints(matchId: string, groupId: string): Promise<MatchMyPoints> {
  return apiGet(`/api/matches/${matchId}/my-points?groupId=${encodeURIComponent(groupId)}`)
}
