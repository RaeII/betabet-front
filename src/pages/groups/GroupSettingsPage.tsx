import { useParams, Navigate } from 'react-router-dom'
import { useGroup } from '@/hooks/useGroups'
import { GroupSettings } from '@/pages/group-detail/components/GroupSettings'

export function GroupSettingsPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const { data, isLoading } = useGroup(groupId ?? '')

  if (isLoading) {
    return <div className="flex h-48 items-center justify-center text-[var(--text-muted)]">Carregando…</div>
  }

  if (!data || data.role !== 'admin') {
    return <Navigate to={`/groups/${groupId}`} replace />
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text)]">Configurações do grupo</h1>
      <GroupSettings group={data.group} />
    </div>
  )
}
