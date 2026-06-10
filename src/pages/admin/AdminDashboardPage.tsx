import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Trophy, Users } from 'lucide-react'
import { StatsCard } from './components/StatsCard'
import { UsersPanel } from './components/UsersPanel'
import { GroupsPanel } from './components/GroupsPanel'
import { getAdminStats } from '@/services/admin.service'
import { cn } from '@/lib/utils'

type Tab = 'users' | 'groups'

const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'groups', label: 'Bolões', icon: Trophy },
]

export function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>('users')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getAdminStats,
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text)]">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard label="Usuários" value={isLoading ? '…' : data?.totalUsers ?? 0} />
        <StatsCard label="Bolões" value={isLoading ? '…' : data?.totalGroups ?? 0} />
        <StatsCard label="Palpites" value={isLoading ? '…' : data?.totalBets ?? 0} />
        <StatsCard label="Partidas" value={isLoading ? '…' : data?.totalMatches ?? 0} />
      </div>

      <div className="space-y-4">
        <div className="flex gap-1 border-b border-[var(--border)]">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                '-mb-px flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                tab === id
                  ? 'border-[var(--brand)] text-[var(--brand)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]',
              )}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {tab === 'users' ? <UsersPanel /> : <GroupsPanel />}
      </div>
    </div>
  )
}
