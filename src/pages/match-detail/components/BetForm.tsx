import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePlaceBet, useEditBet } from '@/hooks/useBets'
import { BetFormSchema } from '@/lib/schemas'
import type { Bet } from '@/types/bet.types'

interface BetFormProps {
  matchId: string
  groupId: string
  existingBet?: Bet | null
  isLocked: boolean
  userGroupCount: number
}

export function BetForm({ matchId, groupId, existingBet, isLocked, userGroupCount }: BetFormProps) {
  const placeBet = usePlaceBet()
  const editBet = useEditBet(matchId)

  const [homeScore, setHomeScore] = useState(existingBet?.homeScore ?? 0)
  const [awayScore, setAwayScore] = useState(existingBet?.awayScore ?? 0)
  const [replicate, setReplicate] = useState(false)
  const [fieldError, setFieldError] = useState('')

  const isEditing = !!existingBet
  const isPending = placeBet.isPending || editBet.isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = BetFormSchema.safeParse({ homeScore, awayScore, replicateToAllGroups: replicate })
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? 'Valores inválidos')
      return
    }
    setFieldError('')

    if (isEditing) {
      editBet.mutate({ betId: existingBet.id, homeScore, awayScore })
    } else {
      placeBet.mutate({ matchId, groupId, homeScore, awayScore, replicateToAllGroups: replicate })
    }
  }

  if (isLocked) {
    return (
      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-center text-sm text-[var(--text-muted)]">
        {existingBet
          ? `Aposta: ${existingBet.homeScore} × ${existingBet.awayScore} — apostas encerradas`
          : 'Apostas encerradas para esta partida'}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <label htmlFor="homeScore" className="text-xs text-[var(--text-muted)]">Casa</label>
          <Input
            id="homeScore"
            type="number"
            min={0}
            max={20}
            value={homeScore}
            onChange={e => setHomeScore(Number(e.target.value))}
            className="w-16 text-center text-2xl font-bold"
            disabled={isPending}
          />
        </div>
        <span className="text-2xl font-bold text-[var(--text-muted)]">×</span>
        <div className="flex flex-col items-center gap-1">
          <label htmlFor="awayScore" className="text-xs text-[var(--text-muted)]">Fora</label>
          <Input
            id="awayScore"
            type="number"
            min={0}
            max={20}
            value={awayScore}
            onChange={e => setAwayScore(Number(e.target.value))}
            className="w-16 text-center text-2xl font-bold"
            disabled={isPending}
          />
        </div>
      </div>

      {fieldError && <p className="text-center text-xs text-[var(--danger)]">{fieldError}</p>}

      {!isEditing && userGroupCount > 1 && (
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text)]">
          <input
            type="checkbox"
            checked={replicate}
            onChange={e => setReplicate(e.target.checked)}
            className="accent-[var(--brand)]"
          />
          Replicar aposta para todos os meus grupos
        </label>
      )}

      {(placeBet.isError || editBet.isError) && (
        <p className="text-center text-xs text-[var(--danger)]">
          Erro ao salvar aposta. Tente novamente.
        </p>
      )}

      {(placeBet.isSuccess || editBet.isSuccess) && (
        <p className="text-center text-xs text-[var(--success)]">
          Aposta salva!
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Salvando…' : isEditing ? 'Atualizar aposta' : 'Apostar'}
      </Button>
    </form>
  )
}
