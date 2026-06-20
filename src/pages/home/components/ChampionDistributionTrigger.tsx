import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { useChampionBet } from '@/hooks/useChampionBet'
import { ChampionDistributionModal } from './ChampionDistributionModal'

interface ChampionDistributionTriggerProps {
  groupId: string
}

/**
 * Botão (abaixo do card "Campeão da Copa") que abre o modal com a distribuição
 * global dos palpites de campeão. Segue a visibilidade do card: só aparece
 * quando a modalidade está habilitada no grupo.
 */
export function ChampionDistributionTrigger({ groupId }: ChampionDistributionTriggerProps) {
  const { data: state } = useChampionBet(groupId)
  const [open, setOpen] = useState(false)

  if (!state?.enabled) return null

  return (
    <div className="mx-auto w-full max-w-[34rem]">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)]/50 hover:text-[var(--brand)] active:scale-[0.99]"
      >
        <BarChart3 size={16} className="text-[var(--brand)]" />
        Palpites de campeão
      </button>

      <ChampionDistributionModal open={open} onOpenChange={setOpen} />
    </div>
  )
}
