import { Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'

export function NotFoundPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--bg)] px-6 py-16 text-[var(--text)]">
      <section
        className="w-full max-w-md rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] p-8 text-center"
        style={{
          boxShadow: isDark
            ? '0 24px 80px rgba(0, 0, 0, 0.28)'
            : '0 24px 80px rgba(21, 23, 19, 0.08)',
        }}
      >
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--brand)]">
          <Home size={24} />
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Erro 404
        </p>
        <h1 className="text-3xl font-semibold leading-tight text-[var(--text)] sm:text-4xl">
          Página não encontrada
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[var(--text-muted)]">
          O endereço acessado não existe ou foi movido. Volte para a home e continue seus palpites.
        </p>

        <Button asChild size="lg" className="mt-8 w-full sm:w-auto">
          <Link to="/">
            <Home size={18} />
            Voltar para a home
          </Link>
        </Button>
      </section>
    </main>
  )
}
