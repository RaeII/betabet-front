import { Link } from 'react-router-dom'
import { useUserGroups } from '@/hooks/useGroups'
import { useGroupRanking } from '@/hooks/useRanking'
import { formatRank } from '@/lib/format.utils'

function GroupRankingCard({ groupId, groupName }: { groupId: string; groupName: string }) {
  const { data } = useGroupRanking(groupId)
  const top3 = data?.ranking.slice(0, 3) ?? []

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text)]">{groupName}</h3>
        <Link to={`/groups/${groupId}`} className="text-xs text-[var(--brand)] hover:underline">
          Ver ranking
        </Link>
      </div>
      {top3.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)]">Sem apostas ainda</p>
      ) : (
        <ol className="space-y-1">
          {top3.map(entry => (
            <li key={entry.userId} className="flex items-center gap-2 text-sm">
              <span className="w-6 text-xs font-bold text-[var(--brand)]">
                {formatRank(entry.position)}
              </span>
              <span className="flex-1 truncate text-[var(--text)]">{entry.userName}</span>
              <span className="font-semibold text-[var(--text)]">{entry.totalPoints}pts</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export function RankingPreview() {
  const { data } = useUserGroups()
  const groups = data?.groups

  if (!groups?.length) return null

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-[var(--text)]">Ranking</h2>
      <div className="space-y-3">
        {groups.slice(0, 2).map(g => (
          <GroupRankingCard key={g.id} groupId={g.id} groupName={g.name} />
        ))}
      </div>
    </section>
  )
}
