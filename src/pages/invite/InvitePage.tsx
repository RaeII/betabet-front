import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { InviteGroupCard } from '@/components/group/InviteGroupCard'
import { Button } from '@/components/ui/button'
import { ReferralApplyHost } from '@/components/referral/ReferralApplyHost'
import { useAuth } from '@/hooks/useAuth'
import { useJoinByCode, useUserGroups } from '@/hooks/useGroups'
import { ApiRequestError } from '@/services/api'
import { resolveInviteCode } from '@/services/groups.service'

export function InvitePage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, isLoading } = useAuth()
  const referralCode = searchParams.get('ref')

  const { data: groupsData, isLoading: isGroupsLoading } = useUserGroups()
  const joinByCode = useJoinByCode()

  const {
    data: invitePreview,
    isLoading: isInviteLoading,
    isError: isInviteInvalid,
  } = useQuery({
    queryKey: ['invite', code],
    queryFn: () => resolveInviteCode(code!),
    enabled: !!code && isAuthenticated,
    retry: false,
  })

  function handleJoin() {
    if (!code || !invitePreview?.group || isGroupsLoading) return

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
            navigate(`/groups/${invitePreview.group.id}`, { replace: true })
          }
        },
      },
    )
  }

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
    return <Navigate to={`/?${params.toString()}`} replace />
  }

  if (isInviteLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-[var(--text-muted)]">
        <Loader2 size={18} className="animate-spin" />
      </div>
    )
  }

  if (
    isInviteInvalid ||
    (joinByCode.isError &&
      !(joinByCode.error instanceof ApiRequestError && joinByCode.error.status === 409))
  ) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-[var(--danger)]">Convite inválido ou expirado.</p>
        <Button onClick={() => navigate('/')}>Ir para o início</Button>
      </div>
    )
  }

  const group = invitePreview?.group
  const isClosedGroup = group?.joinMode === 'request'

  return (
    <>
      <ReferralApplyHost />
      <div className="flex min-h-screen items-center justify-center px-6 py-10">
        <section className="w-full max-w-md space-y-5">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold text-[var(--text)]">Confirmar entrada</h1>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              Revise o convite antes de enviar sua entrada no bolão.
            </p>
          </div>

          {group ? (
            <InviteGroupCard
              group={group}
              hint={isClosedGroup
                ? 'Bolão fechado: sua solicitação será enviada para aprovação do admin.'
                : 'Bolão aberto: confirme para entrar no bolão agora.'}
            />
          ) : null}

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleJoin}
              disabled={!group || isGroupsLoading || joinByCode.isPending}
              className="w-full"
            >
              {joinByCode.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : isClosedGroup ? (
                'Solicitar entrada'
              ) : (
                'Entrar no bolão'
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Agora não
            </Button>
          </div>
        </section>
      </div>
    </>
  )
}
