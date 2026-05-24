import { useActiveGroup } from '@/hooks/useActiveGroup'
import { GroupAvatar } from '@/pages/groups/components/GroupAvatar'
import { GroupGearMenu } from './GroupGearMenu'

export function GroupHeader() {
  const { group } = useActiveGroup()

  return (
    <header
      className="sticky top-0 z-30 border-b border-[var(--border)] pt-[env(safe-area-inset-top)] backdrop-blur-md lg:top-4 md:rounded-[var(--radius-sm)] lg:border lg:border-[var(--border)]"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--surface) 86%, transparent)',
      }}
    >
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {group ? (
            <>
              <GroupAvatar
                name={group.name}
                coverUrl={group.coverUrl}
                emoji={group.emoji}
                size="sm"
              />
              <h1 className="truncate text-base font-semibold text-[var(--text)] sm:text-lg">
                {group.name}
              </h1>
            </>
          ) : (
            <span className="text-sm text-[var(--text-muted)]">Carregando…</span>
          )}
        </div>

        {group ? <GroupGearMenu /> : null}
      </div>
    </header>
  )
}
