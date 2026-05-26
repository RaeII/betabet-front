import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { JoinPendingModal } from './JoinPendingModal'

export interface PendingJoinState {
  groupName: string
  groupEmoji?: string | null
}

interface LocationStateWithPendingJoin {
  pendingJoin?: PendingJoinState
}

export function PendingJoinHost() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationStateWithPendingJoin | null
  const pending = state?.pendingJoin

  const [active, setActive] = useState<PendingJoinState | null>(pending ?? null)

  useEffect(() => {
    if (!pending) return
    setActive(pending)
    const { pendingJoin: _drop, ...rest } = (location.state ?? {}) as LocationStateWithPendingJoin
    navigate(location.pathname + location.search, { replace: true, state: rest })
  }, [pending, navigate, location.pathname, location.search, location.state])

  if (!active) return null

  return (
    <JoinPendingModal
      open
      onOpenChange={(open) => {
        if (!open) setActive(null)
      }}
      groupName={active.groupName}
      groupEmoji={active.groupEmoji}
    />
  )
}
