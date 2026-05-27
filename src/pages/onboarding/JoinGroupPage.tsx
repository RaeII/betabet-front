import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { OnboardingShell } from './components/OnboardingShell'
import { JoinPendingModal } from '@/components/group/JoinPendingModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useJoinByCode, useUserGroups } from '@/hooks/useGroups'
import { resolveInviteCode } from '@/services/groups.service'
import { ApiRequestError } from '@/services/api'

const easeBrasil = [0.2, 0.8, 0.2, 1] as const

function extractCode(input: string): string {
  const match = input.match(/invite\/([A-Za-z0-9]+)/)
  return match ? match[1] : input.trim()
}

export function JoinGroupPage() {
  const navigate = useNavigate()
  const [rawInput, setRawInput] = useState('')
  const [submittedCode, setSubmittedCode] = useState<string | null>(null)
  const [pendingModal, setPendingModal] = useState<{ groupName: string; groupEmoji: string | null } | null>(null)
  const joinByCode = useJoinByCode()
  const { data: groupsData } = useUserGroups()

  const { data: preview, isLoading: isResolving, isError: isInvalid } = useQuery({
    queryKey: ['invite', submittedCode],
    queryFn: () => resolveInviteCode(submittedCode!),
    enabled: !!submittedCode,
    retry: false,
  })

  function handleSubmitCode(e: React.FormEvent) {
    e.preventDefault()
    const code = extractCode(rawInput)
    if (!code) return
    setSubmittedCode(code)
  }

  function handleJoin() {
    if (!submittedCode || !preview?.group) return
    joinByCode.mutate(
      { code: submittedCode },
      {
        onSuccess: ({ joined, group }) => {
          if (joined) {
            navigate(`/groups/${group.id}`)
            return
          }
          setPendingModal({ groupName: group.name, groupEmoji: group.emoji })
        },
        onError: (error) => {
          if (error instanceof ApiRequestError && error.status === 409 && preview?.group) {
            navigate(`/groups/${preview.group.id}`)
          }
        },
      },
    )
  }

  function handlePendingModalClose() {
    setPendingModal(null)
    const firstGroup = groupsData?.groups?.[0]
    if (firstGroup) navigate(`/groups/${firstGroup.id}`)
    else navigate('/onboarding')
  }

  const isClosedGroup = preview?.group?.joinMode === 'request'
  const joinButtonLabel = isClosedGroup ? 'Solicitar entrada' : 'Entrar no grupo'
  const joinModeHint = isClosedGroup
    ? 'Grupo fechado: o admin precisa aprovar sua entrada.'
    : 'Grupo aberto: quem tem este link consegue entrar no bolão.'

  return (
    <OnboardingShell backTo="/onboarding">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: easeBrasil }}
        className="space-y-8 pt-2"
      >
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            <span className="h-1.5 w-6 rounded-full bg-[var(--support)]" />
            Convite
          </span>
          <h1 className="text-[32px] font-semibold leading-[1.1] tracking-[-0.04em] text-[var(--text)]">
            Entrar em um grupo
          </h1>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            Cole o link de convite ou digite o código que você recebeu.
          </p>
        </div>

        <form onSubmit={handleSubmitCode} className="space-y-3">
          <Input
            placeholder="Código ou link de convite"
            value={rawInput}
            onChange={(e) => {
              setRawInput(e.target.value)
              setSubmittedCode(null)
            }}
          />
          <Button type="submit" className="w-full" disabled={!rawInput.trim() || isResolving}>
            {isResolving ? <Loader2 size={16} className="animate-spin" /> : 'Continuar'}
          </Button>
        </form>

        {isInvalid && (
          <p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text)]">
            Convite inválido ou expirado. Verifique o código e tente novamente.
          </p>
        )}

        {preview?.group && (
          <div className="space-y-5 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--surface-soft)] text-2xl">
                {preview.group.emoji ?? '🏆'}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--text)]">
                  {preview.group.name}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  {preview.group.memberCount} membros
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              {joinModeHint}
            </p>
            <Button
              onClick={handleJoin}
              className="w-full"
              disabled={joinByCode.isPending}
            >
              {joinByCode.isPending
                ? <Loader2 size={16} className="animate-spin" />
                : joinButtonLabel}
            </Button>
            {joinByCode.isError && !(joinByCode.error instanceof ApiRequestError && joinByCode.error.status === 409) && (
              <p className="text-sm text-[var(--text-muted)]">
                Erro ao entrar no grupo. Tente novamente.
              </p>
            )}
          </div>
        )}
      </motion.section>

      {pendingModal && (
        <JoinPendingModal
          open
          onOpenChange={(open) => {
            if (!open) handlePendingModalClose()
          }}
          groupName={pendingModal.groupName}
          groupEmoji={pendingModal.groupEmoji}
        />
      )}
    </OnboardingShell>
  )
}
