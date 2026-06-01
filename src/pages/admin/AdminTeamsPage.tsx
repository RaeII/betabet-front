import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, X } from 'lucide-react'
import { deleteTeam, getTeams } from '@/services/admin.service'
import { ApiRequestError } from '@/services/api'
import { TeamFlagImage } from '@/components/match/TeamFlagImage'
import { TeamForm } from './components/TeamForm'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/context/toast.context'
import type { Team } from '@/types/match.types'

export function AdminTeamsPage() {
  const qc = useQueryClient()
  const toast = useToast()
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'teams'],
    queryFn: getTeams,
  })
  const [showForm, setShowForm] = useState(false)
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null)

  const removeTeam = useMutation({
    mutationFn: (teamId: string) => deleteTeam(teamId),
    onSuccess: () => {
      setTeamToDelete(null)
      void qc.invalidateQueries({ queryKey: ['admin', 'teams'] })
      toast({ title: 'Seleção excluída.', variant: 'success' })
    },
    onError: err => {
      const msg = err instanceof ApiRequestError ? err.message : 'Erro ao excluir seleção.'
      toast({ title: msg, variant: 'error' })
    },
  })

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
              <th className="px-4 py-3 text-right font-semibold text-[var(--text-muted)]">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
            {data?.teams.map(team => (
              <tr key={team.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <TeamFlagImage
                      src={team.flagUrl}
                      teamId={team.id}
                      alt={team.name}
                      className="h-5 w-7 rounded object-contain"
                    />
                    <span className="font-medium text-[var(--text)]">{team.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)]">{team.group ?? '—'}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir ${team.name}`}
                    className="text-[var(--text-muted)] hover:text-[var(--danger)]"
                    onClick={() => setTeamToDelete(team)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={teamToDelete !== null}
        onOpenChange={open => {
          if (!open) setTeamToDelete(null)
        }}
        title="Excluir seleção"
        description={
          teamToDelete
            ? `Tem certeza que deseja excluir “${teamToDelete.name}”? Esta ação não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Excluir"
        loadingLabel="Excluindo…"
        destructive
        isLoading={removeTeam.isPending}
        onConfirm={() => {
          if (teamToDelete) removeTeam.mutate(teamToDelete.id)
        }}
      />
    </div>
  )
}
