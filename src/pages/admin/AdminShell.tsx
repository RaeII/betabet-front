import { Outlet, NavLink } from 'react-router-dom'
import { BarChart2, Trophy, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const adminNav = [
  { to: '/admin', end: true, icon: BarChart2, label: 'Dashboard' },
  { to: '/admin/matches', icon: Trophy, label: 'Partidas' },
  { to: '/admin/teams', icon: Users, label: 'Seleções' },
]

export function AdminShell() {
  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="mb-6 text-lg font-bold text-[var(--brand)]">Admin Panel</div>
        <nav className="flex flex-col gap-1">
          {adminNav.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--brand)]/10 text-[var(--brand)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]',
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
