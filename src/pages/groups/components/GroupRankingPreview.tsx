import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatRank } from '@/lib/format.utils'
import type { RankingEntry } from '@/types/group.types'

interface GroupRankingPreviewProps {
  ranking: RankingEntry[]
  currentUserId?: string
  isLoading?: boolean
}

export function GroupRankingPreview({ ranking, currentUserId, isLoading }: GroupRankingPreviewProps) {
  const topEntries = ranking.slice(0, 3)
  const currentUserEntry = ranking.find(entry => entry.userId === currentUserId)

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--text)]">Ranking</h2>
        <Button asChild variant="ghost" size="sm">
          <a href="#ranking-completo">
            Ver ranking
            <ArrowRight size={14} />
          </a>
        </Button>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
        {isLoading && (
          <p className="text-sm text-[var(--text-muted)]">Carregando ranking...</p>
        )}

        {!isLoading && ranking.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">Nenhuma aposta no ranking ainda.</p>
        )}

        {!isLoading && topEntries.length > 0 && (
          <ol className="space-y-3">
            {topEntries.map(entry => (
              <li key={entry.userId} className="flex min-w-0 items-center gap-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-soft)] text-xs font-bold text-[var(--brand)]"
                  aria-label={`Posição ${formatRank(entry.position)}`}
                >
                  {formatRank(entry.position)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--text)]">{entry.userName}</p>
                  <p className="text-xs text-[var(--text-muted)]">{entry.totalBets} apostas</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-[var(--text)]">
                  {entry.totalPoints} pts
                </span>
              </li>
            ))}
          </ol>
        )}

        {currentUserEntry && !topEntries.some(entry => entry.userId === currentUserEntry.userId) && (
          <div className="mt-4 border-t border-[var(--border)] pt-3 text-sm text-[var(--text-muted)]">
            Você está em {formatRank(currentUserEntry.position)} com {currentUserEntry.totalPoints} pts.
          </div>
        )}
      </div>
    </section>
  )
}
