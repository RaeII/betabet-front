import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { groupKeys, useMyJoinRequests } from '@/hooks/useGroups'
import { JoinRejectedModal } from './JoinRejectedModal'
import type { BettingGroup, MyJoinRequest } from '@/types/group.types'

const POLL_INTERVAL_MS = 15_000

export function JoinRequestStatusHost() {
  const qc = useQueryClient()
  const { data } = useMyJoinRequests()
  const requests = data?.requests ?? []

  const initializedRef = useRef(false)
  const prevRequestsRef = useRef<MyJoinRequest[]>([])
  const [rejectedQueue, setRejectedQueue] = useState<MyJoinRequest[]>([])

  useEffect(() => {
    if (!data) return

    if (!initializedRef.current) {
      initializedRef.current = true
      prevRequestsRef.current = requests
      return
    }

    const currentIds = new Set(requests.map((r) => r.groupId))
    const disappeared = prevRequestsRef.current.filter((r) => !currentIds.has(r.groupId))
    prevRequestsRef.current = requests

    if (disappeared.length === 0) return

    void qc.refetchQueries({ queryKey: groupKeys.lists() }).then(() => {
      const groupsData = qc.getQueryData<{ groups: BettingGroup[] }>(groupKeys.lists())
      const memberIds = new Set(groupsData?.groups?.map((g) => g.id) ?? [])
      const rejected = disappeared.filter((r) => !memberIds.has(r.groupId))
      if (rejected.length > 0) {
        setRejectedQueue((prev) => [...prev, ...rejected])
      }
    })
  }, [data, requests, qc])

  useEffect(() => {
    if (requests.length === 0) return
    const interval = setInterval(() => {
      void qc.invalidateQueries({ queryKey: groupKeys.lists() })
      void qc.invalidateQueries({ queryKey: groupKeys.myRequests() })
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [requests.length, qc])

  const current = rejectedQueue[0]
  if (!current) return null

  return (
    <JoinRejectedModal
      open
      onOpenChange={(open) => {
        if (!open) setRejectedQueue((prev) => prev.slice(1))
      }}
      groupName={current.groupName}
      groupEmoji={current.groupEmoji}
    />
  )
}
