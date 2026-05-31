import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { AuthCodeChallenge } from '@/types/auth.types'

interface AuthCodeStatusProps {
  challenge: AuthCodeChallenge | null
  serverError: string
  isSubmitting: boolean
  isResending: boolean
  onResend: () => void
}

function secondsUntil(value: string | undefined, now: number) {
  if (!value) return 0
  const target = new Date(value).getTime()
  if (Number.isNaN(target)) return 0
  return Math.max(0, Math.ceil((target - now) / 1000))
}

function formatCountdown(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const paddedMinutes = String(minutes).padStart(hours > 0 ? 2 : 1, '0')
  const paddedSeconds = String(seconds).padStart(2, '0')

  if (hours > 0) {
    return `${hours}:${paddedMinutes}:${paddedSeconds}`
  }

  return `${paddedMinutes}:${paddedSeconds}`
}

export function AuthCodeStatus({
  challenge,
  serverError,
  isSubmitting,
  isResending,
  onResend,
}: AuthCodeStatusProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    setNow(Date.now())
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000)

    return () => window.clearInterval(intervalId)
  }, [challenge?.expiresAt, challenge?.resendAvailableAt])

  const expiresInSeconds = secondsUntil(challenge?.expiresAt, now)
  const resendInSeconds = secondsUntil(challenge?.resendAvailableAt, now)
  const canResend = Boolean(challenge) && resendInSeconds === 0 && !isSubmitting && !isResending
  const hasDebugCode = Boolean(challenge?.debugCode && !serverError)

  const expirationLabel = expiresInSeconds > 0
    ? `Código expira em ${formatCountdown(expiresInSeconds)}`
    : 'Código expirado'
  const resendLabel = isResending
    ? 'Reenviando...'
    : resendInSeconds > 0
      ? `Reenviar em ${formatCountdown(resendInSeconds)}`
      : 'Reenviar código'

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-[var(--radius-md)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <p className="text-xs font-semibold leading-5 text-[var(--text)]">
            {expirationLabel}
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!canResend}
            onClick={onResend}
            className="w-full shrink-0 px-4 sm:w-auto sm:min-w-32"
          >
            {resendLabel}
          </Button>
        </div>
      </div>

      <div className="min-h-4 overflow-hidden" aria-live="polite" aria-atomic="true">
        <p
          className={`text-xs font-medium leading-4 text-[var(--text-muted)] transition duration-150 ${
            hasDebugCode ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
          }`}
        >
          {hasDebugCode ? `Código de teste: ${challenge?.debugCode}` : ''}
        </p>
      </div>
    </div>
  )
}
