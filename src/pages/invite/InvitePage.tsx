import { useEffect, useRef } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useJoinByCode, useUserGroups } from '@/hooks/useGroups'
import { ApiRequestError } from '@/services/api'

export function InvitePage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, isLoading } = useAuth()
  const referralCode = searchParams.get('ref')

  const { data: groupsData, isLoading: isGroupsLoading } = useUserGroups()
  const joinByCode = useJoinByCode()
  const hasAttempted = useRef(false)

  useEffect(() => {
    if (!code || !isAuthenticated || isGroupsLoading || hasAttempted.current) return
    hasAttempted.current = true
    joinByCode.mutate(
      { code },
      {
        onSuccess: ({ joined, group }) => {
          if (joined) {
            navigate(`/groups/${group.id}`, { replace: true })
            return
          }
          const fallbackGroup = groupsData?.groups?.[0]
          const pendingState = {
            pendingJoin: { groupName: group.name, groupEmoji: group.emoji },
          }
          if (fallbackGroup) {
            navigate(`/groups/${fallbackGroup.id}`, { replace: true, state: pendingState })
          } else {
            navigate('/onboarding', { replace: true, state: pendingState })
          }
        },
        onError: (error) => {
          if (error instanceof ApiRequestError && error.status === 409) {
            const target = groupsData?.groups?.[0]
            navigate(target ? `/groups/${target.id}` : '/onboarding', { replace: true })
          }
        },
      },
    )
  }, [code, isAuthenticated, isGroupsLoading, groupsData, joinByCode, navigate])

  if (!code) return <Navigate to="/" replace />

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-[var(--text-muted)]">
        <Loader2 size={18} className="animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    const params = new URLSearchParams()
    params.set('invite', code)
    if (referralCode) params.set('ref', referralCode)
    return <Navigate to={`/auth/login?${params.toString()}`} replace />
  }

  if (joinByCode.isError && !(joinByCode.error instanceof ApiRequestError && joinByCode.error.status === 409)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-[var(--danger)]">Convite inválido ou expirado.</p>
        <Button onClick={() => navigate('/')}>Ir para o início</Button>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center text-[var(--text-muted)]">
      <Loader2 size={18} className="animate-spin" />
    </div>
  )
}
