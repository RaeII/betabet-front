import { Moon, Sun, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <header
      className="sticky top-0 z-40 border-b border-[var(--border)]"
      style={{
        backgroundColor: isDark
          ? 'rgba(15, 17, 16, 0.86)'
          : 'rgba(247, 244, 236, 0.86)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2" aria-label="Bolão da Copa">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)] text-[var(--brand-text)]">
            <Trophy size={16} />
          </span>
          <span className="text-sm font-bold tracking-tight">Bolão da Copa</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--text-muted)] md:flex">
          <Link to="/matches" className="hover:text-[var(--text)] transition-colors">
            Jogos
          </Link>
          <Link to="/groups" className="hover:text-[var(--text)] transition-colors">
            Grupos
          </Link>
          <Link to="/profile" className="hover:text-[var(--text)] transition-colors">
            Perfil
          </Link>
        </nav>

        <button
          type="button"
          aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
          onClick={toggleTheme}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--text)] transition hover:scale-[1.02]"
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
          <span className="hidden sm:inline">{isDark ? 'Claro' : 'Escuro'}</span>
        </button>
      </div>
    </header>
  )
}
