import { useEffect, useMemo, useState } from 'react'
import { Loader2, Search, X } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TeamFlagImage } from '@/components/match/TeamFlagImage'
import { useTeams } from '@/hooks/useTeams'
import { useUpsertChampionBet } from '@/hooks/useChampionBet'
import { useToast } from '@/context/toast.context'
import { ApiRequestError } from '@/services/api'
import { cn } from '@/lib/utils'
import type { Team } from '@/types/match.types'

interface ChampionBetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  firstPoints: number
  secondPoints: number
  initialFirstId: string | null
  initialSecondId: string | null
}

function SlotChip({
  rank,
  team,
  onClear,
}: {
  rank: 1 | 2
  team: Team | null
  onClear: () => void
}) {
  const label = rank === 1 ? '1º palpite' : '2º palpite'
  return (
    <div className="flex-1 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-soft)] p-3">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        {label}
      </p>
      {team ? (
        <div className="flex items-center gap-2">
          <TeamFlagImage
            src={team.flagUrl}
            teamId={team.id}
            alt={team.name}
            className="h-5 w-7 shrink-0 rounded object-contain"
          />
          <span className="truncate text-sm font-semibold text-[var(--text)]">{team.name}</span>
          <button
            type="button"
            onClick={onClear}
            aria-label={`Remover ${label}`}
            className="ml-auto shrink-0 text-[var(--text-muted)] transition hover:text-[var(--text)]"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">Toque em uma seleção</p>
      )}
    </div>
  )
}

export function ChampionBetModal({
  open,
  onOpenChange,
  groupId,
  firstPoints,
  secondPoints,
  initialFirstId,
  initialSecondId,
}: ChampionBetModalProps) {
  const toast = useToast()
  const { data, isLoading } = useTeams(open)
  const upsert = useUpsertChampionBet(groupId)

  const [search, setSearch] = useState('')
  const [firstId, setFirstId] = useState<string | null>(null)
  const [secondId, setSecondId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setFirstId(initialFirstId)
      setSecondId(initialSecondId)
      setSearch('')
    }
  }, [open, initialFirstId, initialSecondId])

  const teams = data?.teams ?? []
  const firstTeam = useMemo(() => teams.find(t => t.id === firstId) ?? null, [teams, firstId])
  const secondTeam = useMemo(() => teams.find(t => t.id === secondId) ?? null, [teams, secondId])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return teams
    return teams.filter(t => t.name.toLowerCase().includes(term))
  }, [teams, search])

  function handlePick(id: string) {
    if (id === firstId) return setFirstId(null)
    if (id === secondId) return setSecondId(null)
    if (firstId === null) return setFirstId(id)
    if (secondId === null) return setSecondId(id)
    setSecondId(id)
  }

  function handleSave() {
    if (!firstId || !secondId || firstId === secondId) return
    upsert.mutate(
      { firstTeamId: Number(firstId), secondTeamId: Number(secondId) },
      {
        onSuccess: () => {
          toast({ title: 'Palpite de campeão salvo!', variant: 'success' })
          onOpenChange(false)
        },
        onError: err => {
          const msg = err instanceof ApiRequestError ? err.message : 'Erro ao salvar palpite.'
          toast({ title: msg, variant: 'error' })
        },
      },
    )
  }

  const canSave = !!firstId && !!secondId && firstId !== secondId

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Aposta de campeão"
      description={`1º palpite vale ${firstPoints} pts · 2º palpite vale ${secondPoints} pts`}
    >
      <div className="space-y-4 p-5">
        <div className="flex gap-2">
          <SlotChip rank={1} team={firstTeam} onClear={() => setFirstId(null)} />
          <SlotChip rank={2} team={secondTeam} onClear={() => setSecondId(null)} />
        </div>

        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar seleção…"
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-[var(--text-muted)]">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : (
          <div className="grid max-h-[40vh] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
            {filtered.map(team => {
              const isFirst = team.id === firstId
              const isSecond = team.id === secondId
              const selected = isFirst || isSecond
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => handlePick(team.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-[var(--radius-md)] border p-2.5 text-left transition-colors',
                    selected
                      ? 'border-[var(--brand)] bg-[var(--brand)]/10'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand)]/50',
                  )}
                >
                  <TeamFlagImage
                    src={team.flagUrl}
                    teamId={team.id}
                    alt={team.name}
                    className="h-5 w-7 shrink-0 rounded object-contain"
                  />
                  <span className="truncate text-sm font-medium text-[var(--text)]">{team.name}</span>
                  {selected && (
                    <span className="ml-auto shrink-0 rounded-full bg-[var(--brand)] px-1.5 text-[10px] font-bold text-[var(--brand-text)]">
                      {isFirst ? '1º' : '2º'}
                    </span>
                  )}
                </button>
              )
            })}
            {filtered.length === 0 && (
              <p className="col-span-full py-6 text-center text-sm text-[var(--text-muted)]">
                Nenhuma seleção encontrada.
              </p>
            )}
          </div>
        )}

        <Button onClick={handleSave} disabled={!canSave || upsert.isPending} className="w-full">
          {upsert.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Salvar palpite'}
        </Button>
      </div>
    </Modal>
  )
}
