import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GroupCard } from './components/GroupCard'
import { GroupStatePanel } from './components/GroupStatePanel'
import { useUserGroups } from '@/hooks/useGroups'

export function GroupsPage() {
  const { data, isLoading, isError } = useUserGroups()
  const groups = data?.groups

  return (
    <div data-testid="groups-page-shell" className="mx-auto max-w-5xl space-y-6 overflow-x-hidden">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            Escolha o contexto
          </p>
          <h1 className="truncate text-2xl font-bold text-[var(--text)]">Grupos</h1>
        </div>
        <Button asChild size="sm">
          <Link to="/groups/new">
            <Plus size={16} className="mr-1" />
            Criar grupo
          </Link>
        </Button>
      </div>

      {isLoading && (
        <GroupStatePanel title="Carregando grupos..." className="min-h-48" />
      )}

      {isError && (
        <GroupStatePanel
          title="Erro ao carregar grupos."
          description="Tente novamente em instantes."
          className="min-h-48"
        />
      )}

      {groups?.length === 0 && (
        <GroupStatePanel
          title="Você ainda não está em nenhum grupo."
          description="Crie seu primeiro grupo ou aceite um convite para começar a apostar com contexto."
          action={(
            <Button asChild>
              <Link to="/groups/new">Criar meu primeiro grupo</Link>
            </Button>
          )}
        />
      )}

      {groups && groups.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-3">
            {groups.map(group => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>

          <GroupStatePanel
            title="Selecione um grupo"
            description="No desktop, a lista fica à esquerda para manter o contexto visível. No mobile, toque em um grupo para abrir a home dele."
            className="hidden min-h-64 lg:flex lg:flex-col lg:items-center lg:justify-center"
          />
        </div>
      )}
    </div>
  )
}
