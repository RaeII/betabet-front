import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { confirmResult } from '@/services/admin.service'
import { ResultFormSchema } from '@/lib/schemas'

interface MatchResultFormProps {
  matchId: string
  onSuccess: () => void
}

export function MatchResultForm({ matchId, onSuccess }: MatchResultFormProps) {
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = ResultFormSchema.safeParse({ homeScore, awayScore })
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Inválido')
      return
    }
    setError('')
    setIsSubmitting(true)
    try {
      await confirmResult(matchId, result.data)
      onSuccess()
    } catch {
      setError('Erro ao confirmar resultado.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[var(--text)]">Casa</label>
          <Input type="number" min={0} value={homeScore} onChange={e => setHomeScore(Number(e.target.value))} className="w-20 text-center" />
        </div>
        <span className="text-lg text-[var(--text-muted)]">×</span>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[var(--text)]">Fora</label>
          <Input type="number" min={0} value={awayScore} onChange={e => setAwayScore(Number(e.target.value))} className="w-20 text-center" />
        </div>
      </div>
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Confirmando…' : 'Confirmar resultado'}
      </Button>
    </form>
  )
}
