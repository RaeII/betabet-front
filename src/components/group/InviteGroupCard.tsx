import type { InvitePreviewGroup } from '@/types/group.types'

interface InviteGroupCardProps {
  group: InvitePreviewGroup
  hint?: string
}

export function InviteGroupCard({ group, hint }: InviteGroupCardProps) {
  const defaultHint = group.joinMode === 'request'
    ? 'Grupo fechado: sua entrada será analisada pelo admin do bolão.'
    : 'Grupo aberto: quem tem este link consegue entrar no bolão.'

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        Convite para grupo
      </p>
      <div className="mt-3 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface-soft)] text-xl">
          {group.emoji ?? '🏆'}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-[var(--text)]">{group.name}</p>
          <p className="text-xs text-[var(--text-muted)]">{group.memberCount} membros</p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-[var(--text-muted)]">
        {hint ?? defaultHint}
      </p>
    </div>
  )
}
