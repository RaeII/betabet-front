import { useAuth } from '@/hooks/useAuth'
import { ReferralSection } from './components/ReferralSection'
import { Button } from '@/components/ui/button'

export function ProfilePage() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* User info */}
      <div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--surface-soft)] text-2xl font-bold text-[var(--brand)]">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-full object-cover" />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate font-semibold text-[var(--text)]">{user.name}</p>
          <p className="truncate text-sm text-[var(--text-muted)]">{user.email}</p>
        </div>
      </div>

      {/* Referral */}
      <ReferralSection />

      {/* Logout */}
      <Button variant="secondary" className="w-full" onClick={logout}>
        Sair da conta
      </Button>
    </div>
  )
}
