import { Link } from 'react-router-dom'
import { CalendarDays, Settings, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GroupAvatar } from './GroupAvatar'
import type { BettingGroup, GroupRole } from '@/types/group.types'

interface GroupHomeHeroProps {
  group: BettingGroup
  role: GroupRole
  primaryMatchHref?: string
}

export function GroupHomeHero({ group, role, primaryMatchHref }: GroupHomeHeroProps) {
  return (
    <section
      data-testid="group-home-hero"
      className="rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"
    >
      <div className="flex min-w-0 flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <GroupAvatar name={group.name} coverUrl={group.coverUrl} emoji={group.emoji} size="lg" />
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge>{role === 'admin' ? 'Admin' : 'Membro'}</Badge>
              <Badge>{group.memberCount} membros</Badge>
            </div>
            <h1 className="truncate text-2xl font-semibold leading-tight text-[var(--text)] sm:text-3xl">
              {group.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
              Acompanhe as partidas, confira o ranking e entre nos detalhes antes de apostar.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
          <Button asChild className="w-full sm:w-auto">
            <Link to={primaryMatchHref ?? '#proximas-partidas'}>
              <CalendarDays size={16} />
              Próxima partida
            </Link>
          </Button>
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <a href="#detalhes-grupo">
              <Settings size={16} />
              Detalhes
            </a>
          </Button>
          <Button asChild variant="ghost" className="w-full sm:w-auto">
            <a href="#membros-grupo">
              <Users size={16} />
              Membros
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
