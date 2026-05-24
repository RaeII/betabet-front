import { useParams } from 'react-router-dom'
import { GroupRanking } from '@/pages/group-detail/components/GroupRanking'

export function GroupRankingPage() {
  const { groupId } = useParams<{ groupId: string }>()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text)]">Ranking</h1>
      {groupId ? <GroupRanking groupId={groupId} /> : null}
    </div>
  )
}
