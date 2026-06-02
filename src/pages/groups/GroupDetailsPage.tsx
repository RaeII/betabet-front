import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useActiveGroup } from '@/hooks/useActiveGroup'
import { useAuth } from '@/hooks/useAuth'
import { useGroupMembers } from '@/hooks/useGroups'
import { Button } from '@/components/ui/button'
import { GroupAvatar } from '@/pages/groups/components/GroupAvatar'
import { LeaveGroupConfirm } from '@/pages/groups/components/LeaveGroupConfirm'
import { InvitePanel } from '@/pages/group-detail/components/InvitePanel'
import { GroupSettings } from '@/pages/group-detail/components/GroupSettings'

export function GroupDetailsPage() {
  const { groupId, group, role, isAdmin } = useActiveGroup()
  const { user } = useAuth()
  const { data: membersData } = useGroupMembers(groupId ?? '')
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false)

  if (!groupId || !group) {
    return (
      <div className="flex h-48 items-center justify-center text-[var(--text-muted)]">
        Carregando…
      </div>
    )
  }

  const members = membersData?.members ?? []
  const adminCount = members.filter(member => member.role === 'admin').length
  const memberCount = group.memberCount ?? members.length
  const isCheckingLastAdmin = isAdmin && !membersData && memberCount > 1
  const isLastAdmin = isAdmin && Boolean(membersData) && adminCount <= 1 && memberCount > 1
  const leaveDisabledReason = isCheckingLastAdmin
    ? 'Verificando permissões para sair do bolão.'
    : 'Você é o único admin deste bolão. Transfira a administração antes de sair.'
  const leaveNotice = isCheckingLastAdmin
    ? 'Verificando permissões para sair do bolão.'
    : isLastAdmin
      ? 'Você é o único admin deste bolão. Transfira a administração para outro participante antes de sair.'
      : null

  return (
    <>
      <div className="mx-auto max-w-lg space-y-6">
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

        {isAdmin ? (
          <section className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-[var(--text)]">Configurações do Bolão</h2>
              <p className="text-sm text-[var(--text-muted)]">
                Ajuste as regras, a entrada de novos membros e a identificação do bolão.
              </p>
            </div>
            <GroupSettings group={group} />
          </section>
        ) : (
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
        )}

        {role ? (
          <section className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-lg font-semibold text-[var(--text)]">Convite</h2>
            <InvitePanel inviteCode={group.inviteCode} referralCode={user?.referralCode} />
          </section>
        ) : null}

        <section className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-lg font-semibold text-[var(--text)]">Participação</h2>
            <p className="text-sm text-[var(--text-muted)]">
              Saia deste bolão sem encerrar sua conta no aplicativo.
            </p>
            {leaveNotice ? (
              <p className={`text-sm ${isLastAdmin ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'}`}>
                {leaveNotice}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setLeaveConfirmOpen(true)}
            disabled={isCheckingLastAdmin || isLastAdmin}
            title={isCheckingLastAdmin || isLastAdmin ? leaveDisabledReason : undefined}
            className="w-full shrink-0 sm:w-auto"
          >
            <LogOut size={16} />
            Sair do Bolão
          </Button>
        </section>
      </div>

      <LeaveGroupConfirm
        open={leaveConfirmOpen}
        onOpenChange={setLeaveConfirmOpen}
        groupId={groupId}
        groupName={group.name}
      />
    </>
  )
}
