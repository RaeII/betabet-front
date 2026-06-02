import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut, Moon, Sun } from 'lucide-react'
import { PatternBackground } from '@/components/layout/PatternBackground'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'

interface OnboardingShellProps {
  children: ReactNode
  backTo?: string
  step?: { current: number; total: number }
  showLogout?: boolean
  showPattern?: boolean
}

export function OnboardingShell({
  children,
  backTo,
  step,
  showLogout = false,
  showPattern = true,
}: OnboardingShellProps) {
  const { theme, toggleTheme } = useTheme()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const isDark = theme === 'dark'

  async function handleLogout() {
    await logout()
    navigate('/auth/login', { replace: true })
  }

  return (
    <div className="relative min-h-dvh bg-[var(--bg)] text-[var(--text)]">
      {showPattern && <PatternBackground theme={theme} />}

      <header className="relative z-10 mx-auto flex w-full max-w-md items-center justify-between px-6 py-5">
        <div className="flex min-w-0 items-center gap-2">
          {backTo ? (
            <Link
              to={backTo}
              aria-label="Voltar"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition hover:scale-[1.04]"
            >
              <ArrowLeft size={16} />
            </Link>
          ) : (
            <Link to="/onboarding" className="flex items-center gap-2" aria-label="Bolão CLT">
              <img
                src="/bolao_clt_logo.png"
                alt=""
                className="h-9 w-9 shrink-0 object-contain"
                aria-hidden="true"
              />
              <span className="text-sm font-bold tracking-tight">Bolão CLT</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {step && (
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Passo {step.current} de {step.total}
            </span>
          )}
          <button
            type="button"
            aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition hover:scale-[1.04]"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          {showLogout && (
            <button
              type="button"
              aria-label="Sair da conta"
              onClick={handleLogout}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition hover:scale-[1.04]"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-md px-6 pb-12 pt-2">
        {children}
      </main>
    </div>
  )
}
