import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAdminMatches } from '@/services/admin.service'
import { MatchResultForm } from './components/MatchResultForm'
import { MatchStatusBadge } from '@/components/match/MatchStatusBadge'
import { formatMatchDate } from '@/lib/date.utils'
import { Button } from '@/components/ui/button'

export function AdminMatchesPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'matches'],
    queryFn: getAdminMatches,
  })
  const [confirmingMatchId, setConfirmingMatchId] = useState<string | null>(null)

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
    </div>
  )
}
