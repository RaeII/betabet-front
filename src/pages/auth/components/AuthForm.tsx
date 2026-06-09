import type { ReactNode } from 'react'
import { PatternBackground } from '@/components/layout/PatternBackground'
import { useTheme } from '@/hooks/useTheme'

interface AuthFormProps {
  title: string
  subtitle?: string
  logoSrc?: string
  children: ReactNode
}

export function AuthForm({ title, subtitle, logoSrc, children }: AuthFormProps) {
  const { theme } = useTheme()

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <PatternBackground theme={theme} />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt=""
              className="mx-auto h-20 w-auto object-contain"
              aria-hidden="true"
            />
          ) : (
            <span className="text-4xl">🏆</span>
          )}
          <h1 className="mt-3 text-2xl font-bold text-[var(--text)]">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
          )}
        </div>
        <div
          data-football-collider
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
