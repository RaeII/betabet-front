import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateGroup } from '@/hooks/useGroups'
import { GroupCreateSchema } from '@/lib/schemas'

export function CreateGroupPage() {
  const navigate = useNavigate()
  const createGroup = useCreateGroup()
  const [name, setName] = useState('')
  const [resultPoints, setResultPoints] = useState(1)
  const [exactScorePoints, setExactScorePoints] = useState(3)
  const [nameError, setNameError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = GroupCreateSchema.safeParse({ name, resultPoints, exactScorePoints })
    if (!result.success) {
      setNameError(result.error.issues[0]?.message ?? 'Dados inválidos')
      return
    }
    setNameError('')
    createGroup.mutate(result.data, {
      onSuccess: (data) => navigate(`/groups/${data.group.id}`),
    })
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text)]">Criar grupo</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[var(--text)]">Nome do grupo</label>
          <Input
            value={name}
            onChange={e => { setName(e.target.value); setNameError('') }}
            placeholder="Bolão dos Amigos"
            required
            minLength={3}
          />
          {nameError && <span className="text-xs text-[var(--danger)]">{nameError}</span>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--text)]">Pontos por resultado</label>
            <Input type="number" min={1} max={10} value={resultPoints} onChange={e => setResultPoints(Number(e.target.value))} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--text)]">Pontos pelo placar</label>
            <Input type="number" min={1} max={20} value={exactScorePoints} onChange={e => setExactScorePoints(Number(e.target.value))} />
          </div>
        </div>

        {createGroup.isError && (
          <p className="text-sm text-[var(--danger)]">Erro ao criar grupo. Tente novamente.</p>
        )}

        <Button type="submit" disabled={createGroup.isPending} className="w-full">
          {createGroup.isPending ? 'Criando…' : 'Criar grupo'}
        </Button>
      </form>
    </div>
  )
}
