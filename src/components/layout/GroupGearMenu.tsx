import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Info, LogOut, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useActiveGroup } from '@/hooks/useActiveGroup'
import { useGroupMembers } from '@/hooks/useGroups'
import { LeaveGroupConfirm } from '@/pages/groups/components/LeaveGroupConfirm'

export function GroupGearMenu() {
  const { groupId, group, isAdmin } = useActiveGroup()
  const { data: membersData } = useGroupMembers(groupId ?? '')
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!groupId || !group) return null

  const members = membersData?.members ?? []
  const otherAdmins = members.filter(m => m.role === 'admin' && m.userId !== members.find(x => x)?.userId).length
  // Last-admin gate: caller is the only admin AND there are other members
  const adminCount = members.filter(m => m.role === 'admin').length
  const isLastAdmin = isAdmin && adminCount <= 1 && (group.memberCount ?? members.length) > 1
  void otherAdmins // keep variable for clarity

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          aria-label="Ações do grupo"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition hover:text-[var(--text)] focus:outline focus:outline-2 focus:outline-offset-[3px] focus:outline-[var(--brand)]"
        >
          <Settings size={16} />
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            sideOffset={6}
            align="end"
            className="z-50 min-w-[12rem] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg outline-none"
          >
            <DropdownMenu.Item
              onSelect={() => navigate(`/groups/${groupId}/detalhes`)}
              className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text)] outline-none data-[highlighted]:bg-[var(--surface-soft)]"
            >
              <Info size={14} />
              {isAdmin ? 'Configurações do Bolão' : 'Detalhes'}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              disabled={isLastAdmin}
              onSelect={e => {
                if (isLastAdmin) {
                  e.preventDefault()
                  return
                }
                setConfirmOpen(true)
              }}
              title={isLastAdmin ? 'Você é o último admin — transfira a administração antes de sair.' : undefined}
              className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--danger)] outline-none data-[highlighted]:bg-[var(--surface-soft)] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
            >
              <LogOut size={14} />
              Sair
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <LeaveGroupConfirm
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        groupId={groupId}
        groupName={group.name}
      />
    </>
  )
}
