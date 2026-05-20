import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { PatternBackground } from './PatternBackground'
import { useTheme } from '@/hooks/useTheme'

export function AppShell() {
  const { theme } = useTheme()

  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <PatternBackground theme={theme} />
      <div className="relative z-10">
        <Header />
        <main className="mx-auto max-w-7xl px-6 py-6 pb-24 lg:px-8 lg:pb-8">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
