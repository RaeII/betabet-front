import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { BarChart2, Trophy, Users, LogOut, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useTheme } from '@/hooks/useTheme'

const adminNav = [
  { to: '/admin', end: true, icon: BarChart2, label: 'Dashboard' },
  { to: '/admin/matches', icon: Trophy, label: 'Partidas' },
  { to: '/admin/teams', icon: Users, label: 'Seleções' },
]

export function AdminShell() {
  const { adminLogout } = useAdminAuth()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  async function handleLogout() {
    await adminLogout()
    navigate('/admin/login')
  }

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
        <div className="mt-auto flex flex-col gap-1">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-2 rounded-[var(--radius)] px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--brand)]/10 hover:text-[var(--brand)]"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-[var(--radius)] px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
