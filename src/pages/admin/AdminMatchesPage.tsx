import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { deleteMatch, getAdminMatches } from '@/services/admin.service'
import { ApiRequestError } from '@/services/api'
import { MatchResultForm } from './components/MatchResultForm'
import { MatchStatusBadge } from '@/components/match/MatchStatusBadge'
import { formatMatchDate } from '@/lib/date.utils'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/context/toast.context'
import type { Match } from '@/types/match.types'

export function AdminMatchesPage() {
  const qc = useQueryClient()
  const toast = useToast()
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'matches'],
    queryFn: getAdminMatches,
  })
  const [confirmingMatchId, setConfirmingMatchId] = useState<string | null>(null)
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null)

  const removeMatch = useMutation({
    mutationFn: (matchId: string) => deleteMatch(matchId),
    onSuccess: () => {
      setMatchToDelete(null)
      void qc.invalidateQueries({ queryKey: ['admin', 'matches'] })
      toast({ title: 'Partida excluída.', variant: 'success' })
    },
    onError: err => {
      const msg = err instanceof ApiRequestError ? err.message : 'Erro ao excluir partida.'
      toast({ title: msg, variant: 'error' })
    },
  })

  if (isLoading) {
    return <div className="text-[var(--text-muted)]">Carregando partidas…</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text)]">Partidas</h1>

      <div className="space-y-3">
        {data?.matches.map(match => (
          <div
            key={match.id}
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-[var(--text)]">
                  {match.homeTeam.name} vs {match.awayTeam.name}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{formatMatchDate(match.scheduledAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <MatchStatusBadge status={match.status} />
                {match.status === 'finished' && match.homeScore === null && (
                  <Button
                    size="sm"
                    onClick={() => setConfirmingMatchId(match.id)}
                  >
                    Confirmar resultado
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Excluir ${match.homeTeam.name} vs ${match.awayTeam.name}`}
                  className="text-[var(--text-muted)] hover:text-[var(--danger)]"
                  onClick={() => setMatchToDelete(match)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>

            {confirmingMatchId === match.id && (
              <div className="mt-4 border-t border-[var(--border)] pt-4">
                <MatchResultForm
                  matchId={match.id}
                  onSuccess={() => {
                    setConfirmingMatchId(null)
                    void qc.invalidateQueries({ queryKey: ['admin', 'matches'] })
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={matchToDelete !== null}
        onOpenChange={open => {
          if (!open) setMatchToDelete(null)
        }}
        title="Excluir partida"
        description={
          matchToDelete
            ? `Tem certeza que deseja excluir “${matchToDelete.homeTeam.name} vs ${matchToDelete.awayTeam.name}”? As apostas associadas serão removidas. Esta ação não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Excluir"
        loadingLabel="Excluindo…"
        destructive
        isLoading={removeMatch.isPending}
        onConfirm={() => {
          if (matchToDelete) removeMatch.mutate(matchToDelete.id)
        }}
      />
    </div>
  )
}
