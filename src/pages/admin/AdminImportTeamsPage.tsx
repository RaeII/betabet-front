import { Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useImportTeams } from '@/hooks/useImportTeams'
import { ImportStatusPanel } from './components/ImportStatusPanel'
import { TeamPreviewRow } from './components/TeamPreviewRow'

export function AdminImportTeamsPage() {
  const { preview, newCount, saveOne, saveAll } = useImportTeams()

  const isLoadingPreview = preview.isFetching
  const hasPreview = !!preview.data

  function handleBuscar() {
    void preview.refetch()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text)]">Importar Seleções</h1>

      <ImportStatusPanel />

      {preview.isError && (
        <div className="rounded-[var(--radius)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          Serviço externo indisponível. Tente novamente mais tarde.
        </div>
      )}

      {!hasPreview ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <p className="text-[var(--text-muted)] text-sm leading-relaxed">
            Busca todas as seleções da Copa do Mundo disponíveis na API Football.
            Cada seleção é exibida com uma indicação se já está cadastrada no banco local.
            Apenas seleções novas podem ser salvas.
          </p>
          <Button onClick={handleBuscar} disabled={isLoadingPreview}>
            {isLoadingPreview ? <Loader2 size={16} className="animate-spin" /> : null}
            Buscar Seleções da API
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => saveAll.mutate()}
              disabled={saveAll.isPending || newCount === 0}
            >
              {saveAll.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
              Salvar Todas ({newCount} nova{newCount !== 1 ? 's' : ''})
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleBuscar}
              disabled={isLoadingPreview}
              aria-label="Recarregar lista"
            >
              <RefreshCw size={14} className={isLoadingPreview ? 'animate-spin' : ''} />
            </Button>
          </div>

          <ul className="space-y-2">
            {preview.data.teams.map(team => (
              <li key={team.apiTeamId}>
                <TeamPreviewRow
                  team={team}
                  onSave={apiTeamId => saveOne.mutate(apiTeamId)}
                  isSaving={saveOne.isPending && saveOne.variables === team.apiTeamId}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
