import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RotateCcw, Search, Users } from 'lucide-react'
import { listAdminGroups, resetGroupPoints, type AdminGroup } from '@/services/admin.service'
import { ApiRequestError } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/context/toast.context'
import { cn } from '@/lib/utils'

export function AdminResetPointsPage() {
  const qc = useQueryClient()
  const toast = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'groups-list'],
    queryFn: listAdminGroups,
  })

  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const groups = data?.groups ?? []

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return groups
    return groups.filter(g => g.name.toLowerCase().includes(term))
  }, [groups, search])

  const selectedGroup = useMemo<AdminGroup | null>(
    () => groups.find(g => g.id === selectedId) ?? null,
    [groups, selectedId],
  )

  const reset = useMutation({
    mutationFn: (groupId: string) => resetGroupPoints(groupId),
    onSuccess: result => {
      setConfirmOpen(false)
      setSelectedId(null)
      void qc.invalidateQueries({ queryKey: ['admin', 'groups-analytics'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'observer'] })
      toast({
        title:
          `Pontos do bolão “${result.groupName}” zerados. ` +
          `${result.betsReset} aposta(s) e ${result.championBetsReset} palpite(s) de campeão revertidos.`,
        variant: 'success',
      })
    },
    onError: err => {
      const msg = err instanceof ApiRequestError ? err.message : 'Erro ao zerar pontos do bolão.'
      toast({ title: msg, variant: 'error' })
    },
  })

  if (isLoading) {
    return <div className="text-[var(--text-muted)]">Carregando…</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Zerar pontos do bolão</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Zera os pontos de todos os membros de <strong>um único bolão</strong>: pontos por
          partida (resultado + placar exato) e pontos de campeão. Os palpites não são apagados e
          nenhum outro bolão é afetado. A ação é idempotente.
        </p>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar bolão pelo nome…"
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filteredGroups.map(group => {
          const isSelected = group.id === selectedId
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => setSelectedId(group.id)}
              className={cn(
                'flex items-center gap-2 rounded-[var(--radius-md)] border p-3 text-left transition-colors',
                isSelected
                  ? 'border-[var(--brand)] bg-[var(--brand)]/10'
                  : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand)]/50',
              )}
            >
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--text)]">
                {group.name}
              </span>
              <span className="flex shrink-0 items-center gap-1 text-xs text-[var(--text-muted)]">
                <Users size={12} />
                {group.memberCount}
              </span>
            </button>
          )
        })}
        {filteredGroups.length === 0 && (
          <p className="col-span-full text-sm text-[var(--text-muted)]">Nenhum bolão encontrado.</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          variant="destructive"
          disabled={!selectedGroup}
          onClick={() => setConfirmOpen(true)}
        >
          <RotateCcw size={16} />
          {selectedGroup ? `Zerar pontos de “${selectedGroup.name}”` : 'Selecione um bolão'}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={open => {
          if (!reset.isPending) setConfirmOpen(open)
        }}
        title="Zerar pontos do bolão"
        description={
          selectedGroup
            ? `Zerar os pontos de todos os membros de “${selectedGroup.name}”? ` +
              'Todos perdem os pontos no ranking deste bolão (partidas e campeão). ' +
              'Os palpites são mantidos e nenhum outro bolão é afetado.'
            : undefined
        }
        confirmLabel="Zerar pontos"
        loadingLabel="Zerando…"
        isLoading={reset.isPending}
        destructive
        onConfirm={() => {
          if (selectedGroup) reset.mutate(selectedGroup.id)
        }}
      />
    </div>
  )
}
