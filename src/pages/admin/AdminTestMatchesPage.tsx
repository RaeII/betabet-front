import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2, Users } from 'lucide-react'
import { deleteMatch, getTestMatches, type TestMatch } from '@/services/admin.service'
import { ApiRequestError } from '@/services/api'
import { MatchStatusBadge } from '@/components/match/MatchStatusBadge'
import { formatMatchDate } from '@/lib/date.utils'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/context/toast.context'
import type { MatchStatus } from '@/types/match.types'

export function AdminTestMatchesPage() {
  const qc = useQueryClient()
  const toast = useToast()
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'test-matches'],
    queryFn: getTestMatches,
  })
  const [matchToDelete, setMatchToDelete] = useState<TestMatch | null>(null)

  const removeMatch = useMutation({
    mutationFn: (matchId: string) => deleteMatch(matchId),
    onSuccess: () => {
      setMatchToDelete(null)
      void qc.invalidateQueries({ queryKey: ['admin', 'test-matches'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'matches'] })
      toast({ title: 'Partida de teste excluída.', variant: 'success' })
    },
    onError: err => {
      const msg = err instanceof ApiRequestError ? err.message : 'Erro ao excluir partida.'
      toast({ title: msg, variant: 'error' })
    },
  })

  if (isLoading) {
    return <div className="text-[var(--text-muted)]">Carregando partidas de teste…</div>
  }

  const matches = data?.matches ?? []

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-[var(--text)]">Partidas de teste</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Partidas cadastradas pelo Explorer para testar a infra em produção. Excluir uma partida
          remove as apostas e os pontos relacionados de todos os usuários.
        </p>
      </header>

      {matches.length === 0 ? (
        <p className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--text-muted)]">
          Nenhuma partida de teste cadastrada. Cadastre uma em{' '}
          <span className="font-medium">API-Football Explorer</span>.
        </p>
      ) : (
        <div className="space-y-3">
          {matches.map(match => (
            <div
              key={match.id}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--text)]">
                    {match.homeTeamName} vs {match.awayTeamName}
                    {match.homeScore !== null && match.awayScore !== null && (
                      <span className="ml-2 font-mono text-sm text-[var(--text-muted)]">
                        {match.homeScore} × {match.awayScore}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {formatMatchDate(match.scheduledAt)} · {match.betCount} palpite(s)
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    {match.targetGroups.length === 0 ? (
                      <span className="rounded-full bg-[var(--bg)] px-2 py-0.5 text-[11px] text-[var(--text-muted)]">
                        Todos os grupos
                      </span>
                    ) : (
                      match.targetGroups.map(g => (
                        <span
                          key={g.id}
                          className="inline-flex items-center gap-1 rounded-full bg-[var(--brand)]/10 px-2 py-0.5 text-[11px] text-[var(--brand)]"
                        >
                          <Users size={10} />
                          {g.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MatchStatusBadge status={match.status as MatchStatus} />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir ${match.homeTeamName} vs ${match.awayTeamName}`}
                    className="text-[var(--text-muted)] hover:text-[var(--danger)]"
                    onClick={() => setMatchToDelete(match)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={matchToDelete !== null}
        onOpenChange={open => {
          if (!open) setMatchToDelete(null)
        }}
        title="Excluir partida de teste"
        description={
          matchToDelete
            ? `Tem certeza que deseja excluir “${matchToDelete.homeTeamName} vs ${matchToDelete.awayTeamName}”? As apostas e os pontos relacionados serão removidos de todos os usuários. Esta ação não pode ser desfeita.`
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
