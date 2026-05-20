import { useQuery } from '@tanstack/react-query'
import { StatsCard } from './components/StatsCard'
import { getAdminStats } from '@/services/admin.service'

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getAdminStats,
  })

  if (isLoading) {
    return <div className="text-[var(--text-muted)]">Carregando…</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text)]">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard label="Usuários" value={data?.totalUsers ?? 0} />
        <StatsCard label="Grupos" value={data?.totalGroups ?? 0} />
        <StatsCard label="Apostas" value={data?.totalBets ?? 0} />
      </div>
    </div>
  )
}
