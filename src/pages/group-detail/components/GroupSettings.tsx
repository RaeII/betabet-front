import { useEffect, useId, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChampionScoringFields } from '@/components/scoring/ChampionScoringFields'
import { useUpdateGroup } from '@/hooks/useGroups'
import type { BettingGroup } from '@/types/group.types'

interface GroupSettingsProps {
  group: BettingGroup
}

export function GroupSettings({ group }: GroupSettingsProps) {
  const joinModeId = useId()
  const update = useUpdateGroup(group.id)
  const [name, setName] = useState(group.name)
  const [resultPoints, setResultPoints] = useState(group.resultPoints)
  const [exactScorePoints, setExactScorePoints] = useState(group.exactScorePoints)
  const [championBetEnabled, setChampionBetEnabled] = useState(group.championBetEnabled)
  const [championFirstPoints, setChampionFirstPoints] = useState(group.championFirstPoints)
  const [championSecondPoints, setChampionSecondPoints] = useState(group.championSecondPoints)
  const [joinMode, setJoinMode] = useState(group.joinMode)

  useEffect(() => {
    setName(group.name)
    setResultPoints(group.resultPoints)
    setExactScorePoints(group.exactScorePoints)
    setChampionBetEnabled(group.championBetEnabled)
    setChampionFirstPoints(group.championFirstPoints)
    setChampionSecondPoints(group.championSecondPoints)
    setJoinMode(group.joinMode)
  }, [group])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    update.mutate({
      name,
      resultPoints,
      exactScorePoints,
      championBetEnabled,
      championFirstPoints,
      championSecondPoints,
      joinMode,
    })
  }

  const status = update.isError
    ? { message: 'Erro ao salvar configurações.', className: 'text-[var(--danger)]' }
    : update.isSuccess
      ? { message: 'Configurações salvas!', className: 'text-[var(--success)]' }
      : null

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-1">
        <Input label="Nome do bolão" value={name} onChange={e => setName(e.target.value)} required minLength={3} />
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

      <ChampionScoringFields
        enabled={championBetEnabled}
        firstPoints={championFirstPoints}
        secondPoints={championSecondPoints}
        onEnabledChange={setChampionBetEnabled}
        onFirstPointsChange={setChampionFirstPoints}
        onSecondPointsChange={setChampionSecondPoints}
      />

      <div className="flex flex-col gap-1">
        <label htmlFor={joinModeId} className="text-sm font-medium text-[var(--text)]">Entrada no bolão</label>
        <select
          id={joinModeId}
          value={joinMode}
          onChange={e => setJoinMode(e.target.value as 'invite' | 'request')}
          className="min-h-12 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--brand)] focus:outline-none focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--brand)_10%,transparent)]"
        >
          <option value="request">Bolão fechado, solicitação para entrar</option>
          <option value="invite">Aberto, consegue entrar apenas com link do bolão</option>
        </select>
        <p className="text-xs leading-relaxed text-[var(--text-muted)]">
          Nos dois casos o link identifica o bolão. Em bolões fechados, o admin precisa aprovar a entrada.
        </p>
      </div>

      <div className="space-y-2">
        <div className="min-h-4 overflow-hidden" aria-live="polite" aria-atomic="true">
          <p
            className={`text-xs font-medium leading-4 transition duration-150 ${
              status ? `translate-y-0 opacity-100 ${status.className}` : '-translate-y-1 opacity-0'
            }`}
          >
            {status?.message}
          </p>
        </div>

        <Button type="submit" disabled={update.isPending} className="w-full">
          {update.isPending ? 'Salvando…' : 'Salvar configurações'}
        </Button>
      </div>
    </form>
  )
}
