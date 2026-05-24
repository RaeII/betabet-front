import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui/modal'
import { useAuth } from '@/hooks/useAuth'
import { useUserGroups } from '@/hooks/useGroups'
import { setLastAccessedGroup } from '@/services/last-group.service'
import { GroupsModalList } from './GroupsModalList'
import { GroupsModalCreate } from './GroupsModalCreate'

interface GroupsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeGroupId: string | null
}

export function GroupsModal({ open, onOpenChange, activeGroupId }: GroupsModalProps) {
  const { user } = useAuth()
  const { data } = useUserGroups()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'list' | 'create'>('list')

  useEffect(() => {
    if (!open) setMode('list')
  }, [open])

  function handleSelect(groupId: string) {
    if (user) setLastAccessedGroup(user.id, groupId)
    onOpenChange(false)
    if (groupId !== activeGroupId) {
      navigate(`/groups/${groupId}`)
    }
  }

  function handleCreated(newGroupId: string) {
    if (user) setLastAccessedGroup(user.id, newGroupId)
    onOpenChange(false)
    navigate(`/groups/${newGroupId}`, { replace: true })
  }

  const groups = data?.groups ?? []

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'list' ? 'Seus grupos' : 'Criar novo grupo'}
      labelledById="groups-modal-title"
    >
      {mode === 'list' ? (
        <GroupsModalList
          groups={groups}
          activeGroupId={activeGroupId}
          onSelect={handleSelect}
          onCreate={() => setMode('create')}
        />
      ) : (
        <GroupsModalCreate
          onBack={() => setMode('list')}
          onCreated={handleCreated}
        />
      )}
    </Modal>
  )
}
