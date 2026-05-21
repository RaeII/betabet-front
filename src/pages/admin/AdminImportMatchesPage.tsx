import { Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useImportMatches } from '@/hooks/useImportMatches'
import { ImportStatusPanel } from './components/ImportStatusPanel'
import { MatchPreviewRow } from './components/MatchPreviewRow'

export function AdminImportMatchesPage() {
  const { preview, newCount, saveOne, saveAll } = useImportMatches()

  const isLoadingPreview = preview.isFetching
  const hasPreview = !!preview.data

  function handleBuscar() {
    void preview.refetch()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text)]">Importar Partidas</h1>

      <ImportStatusPanel />

      {preview.isError && (
        <div className="rounded-[var(--radius)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          Serviço externo indisponível. Tente novamente mais tarde.
        </div>
      )}

      {!hasPreview ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <p className="text-[var(--text-muted)] text-sm leading-relaxed">
            Busca todas as partidas da Copa do Mundo disponíveis na API Football.
            Cada partida mostra se já está cadastrada e se os times envolvidos estão importados.
          </p>
          <p className="text-xs text-[var(--text-muted)] font-medium">
            ⚠️ As seleções devem ser importadas primeiro — partidas com times ausentes não podem ser salvas.
          </p>
          <Button onClick={handleBuscar} disabled={isLoadingPreview}>
            {isLoadingPreview ? <Loader2 size={16} className="animate-spin" /> : null}
            Buscar Partidas da API
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
            {preview.data.matches.map(match => (
              <li key={match.apiFixtureId}>
                <MatchPreviewRow
                  match={match}
                  onSave={apiFixtureId => saveOne.mutate(apiFixtureId)}
                  isSaving={saveOne.isPending && saveOne.variables === match.apiFixtureId}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
