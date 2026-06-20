import { Outlet } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import { GroupHeader } from './GroupHeader'
import { GroupSidebar } from './GroupSidebar'
import { GroupMobileNav } from './GroupMobileNav'
import { GroupChatWidget } from '@/components/group-chat/GroupChatWidget'

export function GroupShell() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div
      data-testid="group-shell"
      className="relative min-h-screen bg-[var(--bg)] text-[var(--text)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/world-cup-pattern.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '220px 220px',
            opacity: isDark ? 0.09 : 0.035,
            filter: isDark ? 'invert(1)' : 'none',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: isDark
              ? 'rgba(15, 17, 16, 0.72)'
              : 'rgba(245, 243, 238, 0.84)',
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-4 lg:p-4">
        <GroupSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <GroupHeader />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:pb-12">
            <Outlet />
          </main>
        </div>
        <GroupMobileNav />
        <GroupChatWidget />
      </div>
    </div>
  )
}
