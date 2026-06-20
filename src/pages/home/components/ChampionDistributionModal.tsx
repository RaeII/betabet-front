import { Loader2, Crown } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { TeamFlagImage } from '@/components/match/TeamFlagImage'
import { useChampionDistribution } from '@/hooks/useChampionBet'
import { cn } from '@/lib/utils'
import type { ChampionDistributionEntry } from '@/types/champion-bet.types'

interface ChampionDistributionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatPercent(percent: number) {
  // 1 casa decimal, sem zero à direita desnecessário (12.5 / 8 / 0.3)
  return `${Number(percent.toFixed(1))}%`
}

function DistributionRow({ entry, rank }: { entry: ChampionDistributionEntry; rank: number }) {
  const { team, votes, percent } = entry
  const top = rank <= 3
  return (
    <li className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
      {/* Barra de fundo proporcional ao percentual */}
      <div
        className="absolute inset-y-0 left-0 bg-[var(--brand)]/10"
        style={{ width: `${Math.max(percent, 2)}%` }}
        aria-hidden="true"
      />
      <div className="relative flex items-center gap-3 px-3 py-2.5">
        <span
          className={cn(
            'w-5 shrink-0 text-center text-sm font-bold',
            top ? 'text-[var(--brand)]' : 'text-[var(--text-muted)]',
          )}
        >
          {rank}
        </span>
        <TeamFlagImage
          src={team.flagUrl}
          teamId={team.id}
          alt={team.name}
          className="h-5 w-7 shrink-0 rounded object-contain"
        />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--text)]">
          {team.name}
        </span>
        <div className="shrink-0 text-right">
          <span className="block text-sm font-bold text-[var(--text)]">{formatPercent(percent)}</span>
          <span className="block text-[11px] text-[var(--text-muted)]">
            {votes} {votes === 1 ? 'palpite' : 'palpites'}
          </span>
        </div>
      </div>
    </li>
  )
}

export function ChampionDistributionModal({ open, onOpenChange }: ChampionDistributionModalProps) {
  const { data, isLoading, isError } = useChampionDistribution(open)

  const entries = data?.entries ?? []
  const totalBets = data?.totalBets ?? 0

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={
        <span className="inline-flex items-center gap-2">
          <Crown size={18} className="text-[var(--brand)]" />
          Palpites de campeão
        </span>
      }
      description="O que todos os usuários estão apostando para vencer a Copa."
    >
      <div className="space-y-4 p-5">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-[var(--text-muted)]">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : isError ? (
          <p className="py-10 text-center text-sm text-[var(--danger)]">
            Erro ao carregar os palpites.
          </p>
        ) : entries.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--text-muted)]">
            Ainda não há palpites de campeão.
          </p>
        ) : (
          <>
            <p className="text-xs text-[var(--text-muted)]">
              {totalBets} {totalBets === 1 ? 'aposta registrada' : 'apostas registradas'} · 1ª e 2ª
              opção somadas.
            </p>
            <ul className="max-h-[55vh] space-y-2 overflow-y-auto">
              {entries.map((entry, i) => (
                <DistributionRow key={entry.team.id} entry={entry} rank={i + 1} />
              ))}
            </ul>
          </>
        )}
      </div>
    </Modal>
  )
}
