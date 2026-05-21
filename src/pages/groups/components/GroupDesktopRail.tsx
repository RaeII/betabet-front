import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GroupCard } from './GroupCard'
import { GroupStatePanel } from './GroupStatePanel'
import type { BettingGroup } from '@/types/group.types'

interface GroupDesktopRailProps {
  groups: BettingGroup[]
  activeGroupId?: string
  isLoading?: boolean
}

export function GroupDesktopRail({ groups, activeGroupId, isLoading }: GroupDesktopRailProps) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 w-72 max-w-full space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Seus grupos
            </p>
            <h2 className="text-lg font-semibold text-[var(--text)]">Grupo atual</h2>
          </div>
          <Button asChild size="icon" variant="secondary" aria-label="Criar grupo">
            <Link to="/groups/new">
              <Plus size={16} />
            </Link>
          </Button>
        </div>

        <nav aria-label="Grupos do usuário" className="space-y-2">
          {isLoading && (
            <GroupStatePanel
              title="Carregando grupos..."
              className="rounded-[var(--radius-lg)] p-4"
            />
          )}

          {!isLoading && groups.length === 0 && (
            <GroupStatePanel
              title="Nenhum grupo"
              description="Crie ou aceite um convite para começar."
              className="rounded-[var(--radius-lg)] p-4"
            />
          )}

          {groups.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              isActive={group.id === activeGroupId}
              compact
            />
          ))}
        </nav>
      </div>
    </aside>
  )
}
