import { useGroupRanking } from '@/hooks/useRanking'
import { formatRank } from '@/lib/format.utils'

interface GroupRankingProps {
  groupId: string
}

export function GroupRanking({ groupId }: GroupRankingProps) {
  const { data, isLoading } = useGroupRanking(groupId)

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-[var(--text-muted)]">Carregando ranking…</div>
  }

  const ranking = data?.ranking ?? []

  if (ranking.length === 0) {
    return <p className="py-8 text-center text-sm text-[var(--text-muted)]">Nenhuma aposta ainda.</p>
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)]">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[var(--text-muted)]">#</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[var(--text-muted)]">Jogador</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-[var(--text-muted)]">Pts</th>
            <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase text-[var(--text-muted)] sm:table-cell">Placares</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
          {ranking.map(entry => (
            <tr key={entry.userId}>
              <td className="px-4 py-3 font-bold text-[var(--brand)]">{formatRank(entry.position)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-soft)] text-xs font-bold text-[var(--brand)]">
                    {entry.userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-[var(--text)]">{entry.userName}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-semibold text-[var(--text)]">{entry.totalPoints}</td>
              <td className="hidden px-4 py-3 text-right text-[var(--text-muted)] sm:table-cell">{entry.exactScorePredictions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
