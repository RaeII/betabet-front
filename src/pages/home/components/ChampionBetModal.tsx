import { useEffect, useMemo, useState } from 'react'
import { Loader2, Lock, Search, X } from 'lucide-react'
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
  /** 1º palpite ainda em aberto; quando `false`, o slot da opção 1 fica travado. */
  firstOpen: boolean
  firstPoints: number
  secondPoints: number
  initialFirstId: string | null
  initialSecondId: string | null
}

function SlotChip({
  rank,
  team,
  locked,
  onClear,
}: {
  rank: 1 | 2
  team: Team | null
  locked: boolean
  onClear: () => void
}) {
  const label = rank === 1 ? 'Opção 1 de campeão' : 'Opção 2 de campeão'
  return (
    <div className="flex-1 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-soft)] p-3">
      <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        {label}
        {locked && <Lock size={10} aria-label="Travada" />}
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
          {!locked && (
            <button
              type="button"
              onClick={onClear}
              aria-label={`Remover ${label}`}
              className="ml-auto shrink-0 text-[var(--text-muted)] transition hover:text-[var(--text)]"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">
          {locked ? 'Indisponível (1ª rodada encerrada)' : 'Toque em uma seleção'}
        </p>
      )}
    </div>
  )
}

export function ChampionBetModal({
  open,
  onOpenChange,
  groupId,
  firstOpen,
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
    // 1º palpite travado (1ª rodada encerrou): só o 2º pode mudar.
    if (!firstOpen) {
      if (id === firstId) return
      if (id === secondId) return setSecondId(null)
      return setSecondId(id)
    }
    if (id === firstId) return setFirstId(null)
    if (id === secondId) return setSecondId(null)
    if (firstId === null) return setFirstId(id)
    if (secondId === null) return setSecondId(id)
    setSecondId(id)
  }

  function handleSave() {
    // Com a 1ª rodada encerrada (firstOpen=false) a opção 1 fica travada/vazia:
    // basta a opção 2. Com ela aberta, exige as duas opções distintas.
    if (!secondId || (firstOpen && !firstId) || firstId === secondId) return
    upsert.mutate(
      { firstTeamId: firstId ? Number(firstId) : null, secondTeamId: Number(secondId) },
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

  const canSave = !!secondId && (firstOpen ? !!firstId : true) && firstId !== secondId

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Aposta de campeão"
      description={`Opção 1 vale ${firstPoints} pts · opção 2 vale ${secondPoints} pts se for campeã`}
    >
      <div className="space-y-4 p-5">
        <div className="flex gap-2">
          <SlotChip rank={1} team={firstTeam} locked={!firstOpen} onClear={() => setFirstId(null)} />
          <SlotChip rank={2} team={secondTeam} locked={false} onClear={() => setSecondId(null)} />
        </div>

        {!firstOpen && (
          <p className="rounded-[var(--radius-md)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-muted)]">
            A 1ª rodada já terminou: a opção 1 está travada. Você ainda pode escolher a opção 2 até o
            fim da fase de grupos.
          </p>
        )}

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
                      {isFirst ? 'Opção 1' : 'Opção 2'}
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
