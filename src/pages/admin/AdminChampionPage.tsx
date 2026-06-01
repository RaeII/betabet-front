import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Crown, Search, Trash2 } from 'lucide-react'
import { getChampion, getTeams, removeChampion, setChampion } from '@/services/admin.service'
import { ApiRequestError } from '@/services/api'
import { TeamFlagImage } from '@/components/match/TeamFlagImage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/context/toast.context'
import { cn } from '@/lib/utils'
import type { Team } from '@/types/match.types'

function formatSettledAt(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminChampionPage() {
  const qc = useQueryClient()
  const toast = useToast()

  const { data: teamsData, isLoading: loadingTeams } = useQuery({
    queryKey: ['admin', 'teams'],
    queryFn: getTeams,
  })
  const { data: champion, isLoading: loadingChampion } = useQuery({
    queryKey: ['admin', 'champion'],
    queryFn: getChampion,
  })

  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)

  const teams = teamsData?.teams ?? []

  const currentChampion = useMemo(
    () => teams.find(t => t.id === champion?.championTeamId) ?? null,
    [teams, champion?.championTeamId],
  )

  const filteredTeams = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return teams
    return teams.filter(t => t.name.toLowerCase().includes(term))
  }, [teams, search])

  const selectedTeam = useMemo(
    () => teams.find(t => t.id === selectedId) ?? null,
    [teams, selectedId],
  )

  const defineChampion = useMutation({
    mutationFn: (teamId: string) => setChampion(Number(teamId)),
    onSuccess: result => {
      setConfirmOpen(false)
      setSelectedId(null)
      void qc.invalidateQueries({ queryKey: ['admin', 'champion'] })
      toast({
        title: `Campeão definido! ${result.betsSettled} aposta(s) liquidada(s).`,
        variant: 'success',
      })
    },
    onError: err => {
      const msg = err instanceof ApiRequestError ? err.message : 'Erro ao definir campeão.'
      toast({ title: msg, variant: 'error' })
    },
  })

  const clearChampion = useMutation({
    mutationFn: removeChampion,
    onSuccess: result => {
      setRemoveOpen(false)
      setSelectedId(null)
      void qc.invalidateQueries({ queryKey: ['admin', 'champion'] })
      toast({
        title: `Campeão removido. ${result.betsReset} aposta(s) revertida(s).`,
        variant: 'success',
      })
    },
    onError: err => {
      const msg = err instanceof ApiRequestError ? err.message : 'Erro ao remover campeão.'
      toast({ title: msg, variant: 'error' })
    },
  })

  if (loadingTeams || loadingChampion) {
    return <div className="text-[var(--text-muted)]">Carregando…</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Campeão da Copa</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Defina o time campeão para liquidar todas as apostas de campeão (1º palpite, 2º
          palpite ou 0). A ação é idempotente — pode ser refeita para recalcular.
        </p>
      </div>

      {currentChampion && (
        <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--brand)]/30 bg-[var(--brand)]/10 p-4">
          <Crown className="text-[var(--brand)]" size={24} />
          <TeamFlagImage
            src={currentChampion.flagUrl}
            teamId={currentChampion.id}
            alt={currentChampion.name}
            className="h-7 w-10 rounded object-contain"
          />
          <div>
            <p className="font-semibold text-[var(--text)]">
              Campeão atual: {currentChampion.name}
            </p>
            {champion?.settledAt && (
              <p className="text-xs text-[var(--text-muted)]">
                Definido em {formatSettledAt(champion.settledAt)}
              </p>
            )}
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="ml-auto"
            disabled={clearChampion.isPending}
            onClick={() => setRemoveOpen(true)}
          >
            <Trash2 size={14} />
            Remover campeão
          </Button>
        </div>
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

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {filteredTeams.map(team => {
          const isSelected = team.id === selectedId
          const isCurrent = team.id === champion?.championTeamId
          return (
            <button
              key={team.id}
              type="button"
              onClick={() => setSelectedId(team.id)}
              className={cn(
                'flex items-center gap-2 rounded-[var(--radius-md)] border p-3 text-left transition-colors',
                isSelected
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
              <span className="truncate text-sm font-medium text-[var(--text)]">
                {team.name}
              </span>
              {isCurrent && (
                <Crown size={14} className="ml-auto shrink-0 text-[var(--brand)]" />
              )}
            </button>
          )
        })}
        {filteredTeams.length === 0 && (
          <p className="col-span-full text-sm text-[var(--text-muted)]">
            Nenhuma seleção encontrada.
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          disabled={!selectedTeam || selectedTeam.id === champion?.championTeamId}
          onClick={() => setConfirmOpen(true)}
        >
          <Crown size={16} />
          {selectedTeam ? `Definir ${selectedTeam.name} como campeão` : 'Selecione uma seleção'}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={open => {
          if (!defineChampion.isPending) setConfirmOpen(open)
        }}
        title="Definir campeão da Copa"
        description={
          selectedTeam
            ? `Confirmar “${selectedTeam.name}” como campeão? Isto liquidará todas as apostas de campeão em todos os grupos.`
            : undefined
        }
        confirmLabel="Definir campeão"
        loadingLabel="Liquidando…"
        isLoading={defineChampion.isPending}
        onConfirm={() => {
          if (selectedTeam) defineChampion.mutate(selectedTeam.id)
        }}
      />

      <ConfirmDialog
        open={removeOpen}
        onOpenChange={open => {
          if (!clearChampion.isPending) setRemoveOpen(open)
        }}
        title="Remover campeão da Copa"
        description={
          `Remover o campeão${currentChampion ? ` “${currentChampion.name}”` : ''}? ` +
          'Isto zera os pontos de campeão de todas as apostas — todos os usuários ' +
          'perdem os pontos ganhos no ranking.'
        }
        confirmLabel="Remover campeão"
        loadingLabel="Removendo…"
        isLoading={clearChampion.isPending}
        destructive
        onConfirm={() => clearChampion.mutate()}
      />
    </div>
  )
}
