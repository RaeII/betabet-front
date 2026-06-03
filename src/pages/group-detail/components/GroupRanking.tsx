import { useState } from 'react'
import { ChevronRight, TrendingUp } from 'lucide-react'
import { useGroupRanking } from '@/hooks/useRanking'
import { useGroupLiveMyPoints } from '@/hooks/useMatchPoints'
import { useAuth } from '@/hooks/useAuth'
import { formatRank } from '@/lib/format.utils'
import { RankingBreakdownModal } from './RankingBreakdownModal'

interface GroupRankingProps {
  groupId: string
}

interface BreakdownTarget {
  userId: string
  userName: string
  position: number
  totalPoints: number
  isMe: boolean
}

export function GroupRanking({ groupId }: GroupRankingProps) {
  const { data, isLoading } = useGroupRanking(groupId)
  const { user } = useAuth()
  const { liveDelta, hasLiveMatch } = useGroupLiveMyPoints(groupId)
  const [target, setTarget] = useState<BreakdownTarget | null>(null)

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-[var(--text-muted)]">Carregando ranking…</div>
  }

  const ranking = data?.ranking ?? []

  if (ranking.length === 0) {
    return <p className="py-8 text-center text-sm text-[var(--text-muted)]">Nenhuma aposta ainda.</p>
  }

  // Overlay ao vivo: soma os pontos provisórios do usuário autenticado ao seu
  // total confirmado e reordena. Só o próprio usuário tem prévia — o backend
  // expõe pontos provisórios por usuário (`/my-points`); os demais permanecem
  // no total confirmado do `/ranking` até a liquidação. Tie-break estável pela
  // posição original (que já encoda os critérios de desempate do backend).
  const rows = ranking
    .map(entry => {
      const livePoints = entry.userId === user?.id ? liveDelta : 0
      return { ...entry, livePoints, projectedTotal: entry.totalPoints + livePoints }
    })
    .sort((a, b) => b.projectedTotal - a.projectedTotal || a.position - b.position)
    .map((entry, index) => ({ ...entry, livePosition: index + 1 }))

  return (
    <div className="space-y-3">
      {hasLiveMatch ? (
        <div className="flex items-center gap-2 rounded-[var(--radius)] border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-700">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-500 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-500" />
          </span>
          {liveDelta > 0
            ? `Ranking ao vivo — você está ganhando +${liveDelta} pts na partida em andamento (prévia).`
            : 'Partida em andamento — o ranking atualiza conforme os pontos são confirmados.'}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[var(--text-muted)]">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[var(--text-muted)]">Jogador</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-[var(--text-muted)]">Pts</th>
              <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase text-[var(--text-muted)] sm:table-cell">Placares</th>
              <th className="px-2 py-3">
                <span className="sr-only">Detalhes</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
            {rows.map(entry => {
              const isMe = entry.userId === user?.id
              const movedUp = isMe && entry.livePosition < entry.position
              return (
                <tr key={entry.userId} className={isMe ? 'bg-[var(--brand)]/5' : undefined}>
                  <td className="px-4 py-3 font-bold text-[var(--brand)]">
                    <span className="inline-flex items-center gap-1">
                      {formatRank(entry.livePosition)}
                      {movedUp ? (
                        <TrendingUp
                          size={12}
                          className="text-green-600"
                          aria-label={`Subiu ${entry.position - entry.livePosition} posição(ões)`}
                        />
                      ) : null}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-soft)] text-xs font-bold text-[var(--brand)]">
                        {entry.avatarUrl ? (
                          <img src={entry.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          entry.userName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="font-medium text-[var(--text)]">
                        {entry.userName}
                        {isMe ? <span className="ml-1 text-xs text-[var(--text-muted)]">(você)</span> : null}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[var(--text)]">
                    <span className="tabular-nums">{entry.projectedTotal}</span>
                    {entry.livePoints > 0 ? (
                      <span className="ml-1 text-xs font-bold text-green-600">+{entry.livePoints}</span>
                    ) : null}
                  </td>
                  <td className="hidden px-4 py-3 text-right text-[var(--text-muted)] sm:table-cell">{entry.exactScorePredictions}</td>
                  <td className="px-2 py-3 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setTarget({
                          userId: entry.userId,
                          userName: entry.userName,
                          position: entry.position,
                          totalPoints: entry.totalPoints,
                          isMe,
                        })
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--support)]"
                      aria-label={`Ver de onde vieram os pontos de ${entry.userName}`}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {target ? (
        <RankingBreakdownModal
          open={!!target}
          onOpenChange={open => {
            if (!open) setTarget(null)
          }}
          groupId={groupId}
          userId={target.userId}
          userName={target.userName}
          position={target.position}
          totalPoints={target.totalPoints}
          isMe={target.isMe}
        />
      ) : null}
    </div>
  )
}
