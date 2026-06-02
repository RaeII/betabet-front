import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createTeam } from '@/services/admin.service'
import type { Team } from '@/types/match.types'

interface TeamFormProps {
  onSuccess: (team: Team) => void
}

export function TeamForm({ onSuccess }: TeamFormProps) {
  const [name, setName] = useState('')
  const [flagUrl, setFlagUrl] = useState('')
  const [group, setGroup] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !flagUrl.trim()) {
      setError('Nome e URL da bandeira são obrigatórios.')
      return
    }
    setError('')
    setIsSubmitting(true)
    try {
      const { team } = await createTeam({ name: name.trim(), flagUrl: flagUrl.trim(), group: group.trim() || undefined })
      onSuccess(team)
    } catch {
      setError('Erro ao criar seleção.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col gap-1">
        <Input label="Nome" value={name} onChange={e => setName(e.target.value)} placeholder="Brasil" required />
      </div>
      <div className="flex flex-col gap-1">
        <Input label="URL da bandeira" value={flagUrl} onChange={e => setFlagUrl(e.target.value)} placeholder="/flags/br.svg" required />
      </div>
      <div className="flex flex-col gap-1">
        <Input label="Bolão (opcional)" value={group} onChange={e => setGroup(e.target.value)} placeholder="A" maxLength={1} />
      </div>
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Criando…' : 'Criar seleção'}
      </Button>
    </form>
  )
}
