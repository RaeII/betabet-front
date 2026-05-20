import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUpdateGroup } from '@/hooks/useGroups'
import type { BettingGroup } from '@/types/group.types'

interface GroupSettingsProps {
  group: BettingGroup
}

export function GroupSettings({ group }: GroupSettingsProps) {
  const update = useUpdateGroup(group.id)
  const [name, setName] = useState(group.name)
  const [resultPoints, setResultPoints] = useState(group.resultPoints)
  const [exactScorePoints, setExactScorePoints] = useState(group.exactScorePoints)
  const [showBets, setShowBets] = useState(group.showBetsBeforeKickoff)
  const [joinMode, setJoinMode] = useState(group.joinMode)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    update.mutate({ name, resultPoints, exactScorePoints, showBetsBeforeKickoff: showBets, joinMode })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-1">
        <Input label="Nome do grupo" value={name} onChange={e => setName(e.target.value)} required minLength={3} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Input
            label="Pontos por resultado"
            type="number"
            min={1}
            max={10}
            value={resultPoints}
            onChange={e => setResultPoints(Number(e.target.value))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Input
            label="Pontos pelo placar"
            type="number"
            min={1}
            max={20}
            value={exactScorePoints}
            onChange={e => setExactScorePoints(Number(e.target.value))}
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text)]">
        <input
          type="checkbox"
          checked={showBets}
          onChange={e => setShowBets(e.target.checked)}
          className="accent-[var(--brand)]"
        />
        Mostrar apostas antes da partida começar
      </label>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[var(--text)]">Modo de entrada</label>
        <select
          value={joinMode}
          onChange={e => setJoinMode(e.target.value as 'invite' | 'request')}
          className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]"
        >
          <option value="request">Por solicitação</option>
          <option value="invite">Apenas por convite</option>
        </select>
      </div>

      {update.isError && (
        <p className="text-xs text-[var(--danger)]">Erro ao salvar configurações.</p>
      )}
      {update.isSuccess && (
        <p className="text-xs text-[var(--success)]">Configurações salvas!</p>
      )}

      <Button type="submit" disabled={update.isPending} className="w-full">
        {update.isPending ? 'Salvando…' : 'Salvar configurações'}
      </Button>
    </form>
  )
}
