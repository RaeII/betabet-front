import { Trophy } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { TeamFlagImage } from '@/components/match/TeamFlagImage'
import { useGroupUserBreakdown } from '@/hooks/useRanking'
import { formatMatchDate } from '@/lib/date.utils'
import { formatRank, formatScore } from '@/lib/format.utils'
import type { Bet } from '@/types/bet.types'
import type { MatchWithUserBet } from '@/types/match.types'

interface RankingBreakdownModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  userId: string
  userName: string
  avatarUrl?: string | null
  position: number
  totalPoints: number
  isMe?: boolean
}

/** Pontos definitivos (liquidados) do palpite. `null` enquanto não apurados. */
function settledPoints(bet: Bet | null): { result: number; exact: number; total: number } | null {
  if (!bet || bet.resultPoints === null) return null
  const result = bet.resultPoints
  const exact = bet.exactScorePoints ?? 0
  return { result, exact, total: result + exact }
}

/** Janela máxima de um jogo (prorrogação + pênaltis). Passado disso, um status
 *  `live` significa "encerrado, aguardando liquidação do admin" — não "rolando
 *  agora". O status no banco fica `live` do apito até o admin confirmar. */
const LIVE_WINDOW_MS = 3 * 60 * 60 * 1000

/** Só partidas que já começaram: em andamento ou encerradas. Exclui as futuras
 *  (`upcoming`) e canceladas — o detalhamento é sobre jogos que já rolaram. */
function isPastOrLive(match: MatchWithUserBet): boolean {
  return match.status === 'live' || match.status === 'finished'
}

/** Rótulo quando ainda não há pontos apurados. Distingue "rolando agora" de
 *  "já acabou mas o admin não liquidou". */
function pendingLabel(match: MatchWithUserBet): string {
  if (match.status === 'live') {
    const elapsed = Date.now() - new Date(match.scheduledAt).getTime()
    if (elapsed >= 0 && elapsed < LIVE_WINDOW_MS) return 'Ao vivo'
  }
  return 'Apurando'
}

export function RankingBreakdownModal({
  open,
  onOpenChange,
  groupId,
  userId,
  userName,
  avatarUrl,
  position,
  totalPoints,
  isMe = false,
}: RankingBreakdownModalProps) {
  const { data, isLoading, isError } = useGroupUserBreakdown(groupId, userId, open)

  const matches = (data?.matches ?? [])
    .filter(isPastOrLive)
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

  const headerTitle = (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-soft)] text-sm font-bold text-[var(--brand)]">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          userName.charAt(0).toUpperCase()
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-bold text-[var(--text)]">
          {isMe ? 'Seus pontos' : userName}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <Trophy size={11} className="shrink-0 text-[var(--brand)]" aria-hidden />
          <span>
            Posição{' '}
            <span className="font-bold text-[var(--brand)]">{formatRank(position)}</span>
          </span>
          <span aria-hidden>·</span>
          <span>
            <span className="font-semibold tabular-nums text-[var(--text)]">{totalPoints}</span> pts
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={headerTitle}
      description="De onde vieram os pontos no ranking — partida a partida."
    >
      <div className="space-y-3 p-4">
        {isLoading ? (
          <div className="space-y-2" aria-label="Carregando detalhamento">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-[88px] rounded-[var(--radius-lg)] bg-[var(--surface-soft)]" />
            ))}
          </div>
        ) : null}

        {isError ? (
          <p role="alert" className="text-sm text-[var(--danger)]">
            Não foi possível carregar o detalhamento. Tente novamente.
          </p>
        ) : null}

        {!isLoading && !isError && data && matches.length === 0 ? (
          <p className="py-3 text-center text-sm text-[var(--text-muted)]">
            Nenhuma partida finalizada ou em andamento ainda.
          </p>
        ) : null}

        {!isLoading && !isError && data && matches.length > 0 ? (
          <ul className="space-y-2">
            {matches.map(match => (
              <BreakdownRow key={match.id} match={match} />
            ))}
          </ul>
        ) : null}
      </div>
    </Modal>
  )
}

function BreakdownRow({ match }: { match: MatchWithUserBet }) {
  const bet = match.userBet
  const points = settledPoints(bet)

  return (
    <li className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="text-xs text-[var(--text-muted)]">{formatMatchDate(match.scheduledAt)}</span>
        <PointsBadge match={match} points={points} hasBet={!!bet} />
      </div>

      <div className="flex items-center gap-2">
        <TeamSide
          name={match.homeTeam.name}
          flagUrl={match.homeTeam.flagUrl}
          teamId={match.homeTeam.id}
          align="start"
        />
        <span className="shrink-0 px-2 text-base font-bold tabular-nums text-[var(--text)]">
          {formatScore(match.homeScore, match.awayScore)}
        </span>
        <TeamSide
          name={match.awayTeam.name}
          flagUrl={match.awayTeam.flagUrl}
          teamId={match.awayTeam.id}
          align="end"
        />
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-1 border-t border-[var(--border)] pt-2">
        {bet ? (
          <div className="flex flex-col">
            <span className="text-[11px] text-[var(--text-muted)]">Palpite</span>
            <span className="text-base font-bold tabular-nums text-[var(--text)]">
              {bet.homeScore} × {bet.awayScore}
            </span>
          </div>
        ) : (
          <span className="text-xs italic text-[var(--text-muted)]">Não palpitou</span>
        )}

        {points && points.total > 0 ? (
          <div className="flex flex-wrap justify-end gap-1.5">
            {points.result > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--text)]">
                Resultado <span className="font-bold text-[var(--brand)]">+{points.result}</span>
              </span>
            ) : null}
            {points.exact > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--text)]">
                Placar exato <span className="font-bold text-[var(--brand)]">+{points.exact}</span>
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </li>
  )
}

function PointsBadge({
  match,
  points,
  hasBet,
}: {
  match: MatchWithUserBet
  points: { total: number } | null
  hasBet: boolean
}) {
  if (points) {
    const tone =
      points.total > 0
        ? 'border-green-500/30 bg-green-500/10 text-green-600'
        : 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]'
    return (
      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums ${tone}`}>
        {points.total > 0 ? '+' : ''}
        {points.total} pts
      </span>
    )
  }

  if (!hasBet) return null
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-muted)]">
      {pendingLabel(match)}
    </span>
  )
}

function TeamSide({
  name,
  flagUrl,
  teamId,
  align,
}: {
  name: string
  flagUrl: string
  teamId: string
  align: 'start' | 'end'
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-2 ${align === 'end' ? 'flex-row-reverse text-right' : ''}`}
    >
      <TeamFlagImage
        src={flagUrl}
        teamId={teamId}
        alt=""
        className="h-4 w-6 shrink-0 rounded object-contain shadow-sm"
      />
      <span className="min-w-0 truncate text-sm font-medium text-[var(--text)]">{name}</span>
    </div>
  )
}
