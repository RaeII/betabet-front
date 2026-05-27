import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui/modal'
import { useAuth } from '@/hooks/useAuth'
import { useMyJoinRequests, useUserGroups } from '@/hooks/useGroups'
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
  const { data: requestsData, isLoading: isLoadingRequests } = useMyJoinRequests(open)
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

  function handleJoinGroup() {
    onOpenChange(false)
    navigate('/onboarding/join')
  }

  const groups = data?.groups ?? []
  const pendingRequests = requestsData?.requests ?? []

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'list' ? 'Seus grupos' : 'Criar novo grupo'}
    >
      {mode === 'list' ? (
        <GroupsModalList
          groups={groups}
          activeGroupId={activeGroupId}
          pendingRequests={pendingRequests}
          isLoadingRequests={isLoadingRequests}
          onSelect={handleSelect}
          onJoin={handleJoinGroup}
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
