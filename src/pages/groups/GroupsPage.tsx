import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GroupCard } from './components/GroupCard'
import { useUserGroups } from '@/hooks/useGroups'

export function GroupsPage() {
  const { data, isLoading, isError } = useUserGroups()
  const groups = data?.groups

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text)]">Grupos</h1>
        <Button asChild size="sm">
          <Link to="/groups/new">
            <Plus size={16} className="mr-1" />
            Criar grupo
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex h-48 items-center justify-center text-[var(--text-muted)]">
          Carregando grupos…
        </div>
      )}

      {isError && (
        <div className="flex h-48 items-center justify-center text-[var(--danger)]">
          Erro ao carregar grupos.
        </div>
      )}

      {groups?.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-[var(--text-muted)]">Você ainda não está em nenhum grupo.</p>
          <Button asChild className="mt-4">
            <Link to="/groups/new">Criar meu primeiro grupo</Link>
          </Button>
        </div>
      )}

      {groups && groups.length > 0 && (
        <div className="space-y-3">
          {groups.map(group => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  )
}
