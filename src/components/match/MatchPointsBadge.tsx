import type { Bet } from '@/types/bet.types'
import type { MatchStatus } from '@/types/match.types'

interface MatchPointsBadgeProps {
  matchId: string
  groupId: string
  status: MatchStatus
  /** Quando disponível (ex.: lista de palpites), os pontos definitivos de uma
   *  partida encerrada já vêm no palpite — exibidos sem nenhuma requisição. */
  userBet?: Bet | null
}

/**
 * Pílula compacta com os pontos do usuário numa partida, reutilizável em listas
 * e cards pelo app. Ao vivo busca o provisório via `/my-points` — usa a mesma
 * queryKey do overlay do ranking, então o React Query deduplica e não dispara
 * request extra para partidas já acompanhadas. Encerrada usa os pontos
 * definitivos do próprio palpite (`resultPoints`/`exactScorePoints`), sem rede.
 */
export function MatchPointsBadge({ matchId, groupId, status, userBet }: MatchPointsBadgeProps) {
  // Só o estado "live" interno dispara a busca: cobre tanto a partida em
  // andamento quanto a janela entre o apito (upstream FT) e o tick de
  // liquidação, quando o status interno ainda é "live" e os pontos do palpite
  // ainda não foram gravados. Após liquidar, vira "finished" + pontos no bet.

  if (status === 'finished' && userBet && userBet.resultPoints !== null) {
    return <Pill total={userBet.resultPoints + (userBet.exactScorePoints ?? 0)} confirmed />
  }

  return null
}

function Pill({ total, confirmed }: { total: number; confirmed: boolean }) {
  const label = `${total > 0 ? '+' : ''}${total} pts`

  if (confirmed) {
    const tone =
      total > 0
        ? 'border-green-500/30 bg-green-500/10 text-green-600'
        : 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]'
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums ${tone}`}
      >
        {label}
      </span>
    )
  }

  // Provisório (ao vivo) — ponto pulsante para sinalizar que muda com o placar.
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-yellow-600">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-500 opacity-70" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-yellow-500" />
      </span>
      {label}
    </span>
  )
}
