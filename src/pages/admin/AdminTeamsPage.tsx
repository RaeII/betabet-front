import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getTeams } from '@/services/admin.service'
import { TeamForm } from './components/TeamForm'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'

export function AdminTeamsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'teams'],
    queryFn: getTeams,
  })
  const [showForm, setShowForm] = useState(false)

  if (isLoading) {
    return <div className="text-[var(--text-muted)]">Carregando seleções…</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text)]">Seleções</h1>
        <Button size="sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancelar' : 'Nova seleção'}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
          <TeamForm
            onSuccess={() => {
              setShowForm(false)
              void qc.invalidateQueries({ queryKey: ['admin', 'teams'] })
            }}
          />
        </div>
      )}

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)]">
              <th className="px-4 py-3 text-left font-semibold text-[var(--text-muted)]">Seleção</th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--text-muted)]">Grupo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
            {data?.teams.map(team => (
              <tr key={team.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <img src={team.flagUrl} alt={team.name} className="h-5 w-7 rounded object-cover" />
                    <span className="font-medium text-[var(--text)]">{team.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)]">{team.group ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
