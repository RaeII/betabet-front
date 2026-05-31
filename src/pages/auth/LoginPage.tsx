import { useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getApiRequestMessage } from './authError'
import { AuthCodeInput } from './components/AuthCodeInput'
import { AuthCodeStatus } from './components/AuthCodeStatus'
import { AuthField } from './components/AuthField'
import { AuthForm } from './components/AuthForm'
import { InviteGroupCard } from '@/components/group/InviteGroupCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { useJoinByCode } from '@/hooks/useGroups'
import { AuthCodeSchema, UserLoginSchema } from '@/lib/schemas'
import { resolveInviteCode } from '@/services/groups.service'
import { ApiRequestError } from '@/services/api'
import type { AuthCodeChallenge, LoginCredentials } from '@/types/auth.types'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inviteCode = searchParams.get('invite')
  const referralCode = searchParams.get('ref')
  const { requestLoginCode, verifyLoginCode } = useAuth()
  const joinByCode = useJoinByCode()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [values, setValues] = useState<LoginCredentials>({ email: '' })
  const [code, setCode] = useState('')
  const [challenge, setChallenge] = useState<AuthCodeChallenge | null>(null)
  const [errors, setErrors] = useState<Partial<LoginCredentials & { code: string }>>({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const codeRequestInFlightRef = useRef(false)

  const { data: invitePreview, isError: isInviteInvalid } = useQuery({
    queryKey: ['invite', inviteCode],
    queryFn: () => resolveInviteCode(inviteCode!),
    enabled: !!inviteCode,
    retry: false,
  })

  function handleChange(field: keyof LoginCredentials) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues(prev => ({ ...prev, [field]: e.target.value }))
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  function withReferralSearch(path: string) {
    if (!referralCode) return path
    return `${path}?ref=${encodeURIComponent(referralCode)}`
  }

  async function attemptJoin(code: string): Promise<void> {
    try {
      const { joined, group } = await joinByCode.mutateAsync({ code })
      if (joined) {
        navigate(withReferralSearch(`/groups/${group.id}`), { replace: true })
        return
      }
      navigate(withReferralSearch('/'), {
        replace: true,
        state: { pendingJoin: { groupName: group.name, groupEmoji: group.emoji } },
      })
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 409 && invitePreview?.group) {
        navigate(withReferralSearch(`/groups/${invitePreview.group.id}`), { replace: true })
        return
      }
      navigate(withReferralSearch('/'), { replace: true })
    }
  }

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault()
    const result = UserLoginSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors: Partial<LoginCredentials> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof LoginCredentials
        fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    if (codeRequestInFlightRef.current) return

    codeRequestInFlightRef.current = true
    setIsSubmitting(true)
    setServerError('')
    try {
      const nextChallenge = await requestLoginCode(result.data.email)
      setChallenge(nextChallenge)
      setStep('code')
      setCode('')
      setErrors({})
    } catch (error) {
      setServerError(getApiRequestMessage(error, 'Não foi possível enviar o código. Tente novamente.'))
    } finally {
      codeRequestInFlightRef.current = false
      setIsSubmitting(false)
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    const result = AuthCodeSchema.safeParse({ code })
    if (!result.success) {
      setErrors({ code: result.error.issues[0]?.message ?? 'Código inválido' })
      return
    }
    if (!challenge) {
      setServerError('Solicite um novo código para continuar.')
      return
    }
    setIsSubmitting(true)
    setServerError('')
    try {
      await verifyLoginCode({ challengeId: challenge.challengeId, code: result.data.code })
      if (inviteCode && !isInviteInvalid) {
        await attemptJoin(inviteCode)
      } else {
        navigate(withReferralSearch('/'))
      }
    } catch {
      setServerError('Código inválido ou expirado.')
      setIsSubmitting(false)
    }
  }

  async function handleResendCode() {
    const result = UserLoginSchema.safeParse(values)
    if (!result.success) {
      setStep('email')
      return
    }

    if (codeRequestInFlightRef.current) return

    codeRequestInFlightRef.current = true
    setIsResending(true)
    setServerError('')
    try {
      const nextChallenge = await requestLoginCode(result.data.email)
      setChallenge(nextChallenge)
      setCode('')
      setErrors({})
    } catch (error) {
      setServerError(getApiRequestMessage(error, 'Não foi possível reenviar o código. Tente novamente.'))
    } finally {
      codeRequestInFlightRef.current = false
      setIsResending(false)
    }
  }

  const registerParams = new URLSearchParams()
  if (inviteCode) registerParams.set('invite', inviteCode)
  if (referralCode) registerParams.set('ref', referralCode)
  const registerSearch = registerParams.toString()

  return (
    <AuthForm title="Bolão da Copa" subtitle="Entre na sua conta para apostar">
      {step === 'email' ? (
        <form onSubmit={handleRequestCode} className="flex flex-col gap-2" noValidate>
          <AuthField errorId="email-error" error={errors.email}>
            <Input
              id="email"
              label="E-mail"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={handleChange('email')}
              aria-invalid={!!errors.email}
              aria-describedby="email-error"
            />
          </AuthField>

          <div className="flex flex-col gap-2">
            <div className="min-h-4 overflow-hidden" aria-live="polite" aria-atomic="true">
              <p
                className={`text-xs font-medium leading-4 text-[var(--danger)] transition duration-150 ${
                  serverError ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
                }`}
              >
                {serverError}
              </p>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Enviando…' : 'Enviar código'}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-2" noValidate>
          <p className="text-sm text-[var(--text-muted)]">
            Enviamos um código para <span className="font-medium text-[var(--text)]">{values.email}</span>.
          </p>

          <AuthField errorId="code-error" error={errors.code}>
            <AuthCodeInput
              id="code"
              value={code}
              onChange={nextCode => {
                setCode(nextCode)
                setErrors(prev => ({ ...prev, code: undefined }))
              }}
              invalid={!!errors.code}
              errorId="code-error"
            />
          </AuthField>

          <AuthCodeStatus
            challenge={challenge}
            serverError={serverError}
            isSubmitting={isSubmitting}
            isResending={isResending}
            onResend={handleResendCode}
          />

          <div className="flex flex-col gap-2">
            <div className="min-h-4 overflow-hidden" aria-live="polite" aria-atomic="true">
              <p
                className={`text-xs font-medium leading-4 text-[var(--danger)] transition duration-150 ${
                  serverError ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
                }`}
              >
                {serverError}
              </p>
            </div>

            <Button type="submit" disabled={isSubmitting || isResending} className="w-full">
              {isSubmitting ? 'Validando…' : 'Validar código'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting || isResending}
              className="w-full"
              onClick={() => {
                setStep('email')
                setServerError('')
                setErrors({})
              }}
            >
              Alterar e-mail
            </Button>
          </div>
        </form>
      )}

      {invitePreview?.group && (
        <div className="mt-4">
          <InviteGroupCard
            group={invitePreview.group}
            hint="Faça login para entrar neste grupo."
          />
        </div>
      )}

      {inviteCode && isInviteInvalid && (
        <p className="mt-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text)]">
          Convite inválido ou expirado. Verifique o link recebido.
        </p>
      )}

      <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
        Não tem conta?{' '}
        <Link
          to={`/auth/register${registerSearch ? `?${registerSearch}` : ''}`}
          className="font-medium text-[var(--brand)] hover:underline"
        >
          Cadastre-se
        </Link>
      </p>
    </AuthForm>
  )
}
