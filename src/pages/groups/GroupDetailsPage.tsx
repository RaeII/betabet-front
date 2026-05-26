import { useActiveGroup } from '@/hooks/useActiveGroup'
import { GroupAvatar } from '@/pages/groups/components/GroupAvatar'
import { InvitePanel } from '@/pages/group-detail/components/InvitePanel'

export function GroupDetailsPage() {
  const { groupId, group, role } = useActiveGroup()
  if (!groupId || !group) {
    return (
      <div className="flex h-48 items-center justify-center text-[var(--text-muted)]">
        Carregando…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col items-center gap-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
        <GroupAvatar
          name={group.name}
          coverUrl={group.coverUrl}
          emoji={group.emoji}
          size="lg"
        />
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[var(--text)]">{group.name}</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {group.memberCount} {group.memberCount === 1 ? 'membro' : 'membros'}
          </p>
        </div>
      </section>

      <section className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-semibold text-[var(--text)]">Pontuação</h2>
        <ul className="space-y-1 text-sm text-[var(--text)]">
          <li>
            Acertar o vencedor:{' '}
            <strong>{group.resultPoints} {group.resultPoints === 1 ? 'ponto' : 'pontos'}</strong>
          </li>
          <li>
            Acertar o placar exato (bônus):{' '}
            <strong>
              +{group.exactScorePoints} {group.exactScorePoints === 1 ? 'ponto' : 'pontos'}
            </strong>
          </li>
        </ul>
      </section>

      {role ? (
        <section className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-lg font-semibold text-[var(--text)]">Convite</h2>
          <InvitePanel inviteCode={group.inviteCode} />
        </section>
      ) : null}
    </div>
  )
}
