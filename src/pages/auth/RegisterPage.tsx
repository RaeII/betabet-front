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
import { AuthCodeSchema, RegisterSchema } from '@/lib/schemas'
import { resolveInviteCode } from '@/services/groups.service'
import type { AuthCodeChallenge, RegisterData } from '@/types/auth.types'

type FormValues = Omit<RegisterData, 'referralCode'> & { referralCode: string }

export function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { requestRegisterCode, verifyRegisterCode } = useAuth()
  const joinByCode = useJoinByCode()
  const inviteCode = searchParams.get('invite')
  const referralCode = searchParams.get('ref')
  const prefillEmail = searchParams.get('email')

  const [step, setStep] = useState<'data' | 'code'>('data')
  const [values, setValues] = useState<FormValues>({
    name: '',
    email: prefillEmail ?? '',
    referralCode: referralCode ?? '',
  })
  const [code, setCode] = useState('')
  const [challenge, setChallenge] = useState<AuthCodeChallenge | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues | 'code', string>>>({})
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

  function handleChange(field: keyof FormValues) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues(prev => ({ ...prev, [field]: e.target.value }))
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  async function attemptJoin(code: string): Promise<void> {
    try {
      const { joined, group } = await joinByCode.mutateAsync({ code })
      if (joined) {
        navigate(`/groups/${group.id}`, { replace: true })
        return
      }
      navigate('/onboarding', {
        replace: true,
        state: { pendingJoin: { groupName: group.name, groupEmoji: group.emoji } },
      })
    } catch {
      navigate('/onboarding', { replace: true })
    }
  }

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault()
    const result = RegisterSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormValues, string>> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormValues
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    if (codeRequestInFlightRef.current) return

    codeRequestInFlightRef.current = true
    setIsSubmitting(true)
    setServerError('')
    try {
      const nextChallenge = await requestRegisterCode(result.data as RegisterData)
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
      await verifyRegisterCode({ challengeId: challenge.challengeId, code: result.data.code })
      if (inviteCode && !isInviteInvalid) {
        await attemptJoin(inviteCode)
      } else {
        navigate('/')
      }
    } catch (error) {
      setServerError(getApiRequestMessage(error, 'Código inválido ou expirado.'))
      setIsSubmitting(false)
    }
  }

  async function handleResendCode() {
    const result = RegisterSchema.safeParse(values)
    if (!result.success) {
      setStep('data')
      return
    }

    if (codeRequestInFlightRef.current) return

    codeRequestInFlightRef.current = true
    setIsResending(true)
    setServerError('')
    try {
      const nextChallenge = await requestRegisterCode(result.data as RegisterData)
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

  const loginParams = new URLSearchParams()
  if (inviteCode) loginParams.set('invite', inviteCode)
  if (referralCode) loginParams.set('ref', referralCode)
  const loginSearch = loginParams.toString()

  return (
    <AuthForm
      title="Criar conta"
      subtitle="Participe do Bolão da Copa"
      logoSrc="/bolao_clt_logo.png"
    >
      {step === 'data' ? (
        <form onSubmit={handleRequestCode} className="flex flex-col gap-2" noValidate>
          <AuthField errorId="name-error" error={errors.name}>
            <Input
              id="name"
              label="Nome"
              autoComplete="name"
              value={values.name}
              onChange={handleChange('name')}
              aria-invalid={!!errors.name}
              aria-describedby="name-error"
            />
          </AuthField>

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

          <AuthField errorId="referral-code-error" error={errors.referralCode}>
            <Input
              id="referralCode"
              label={<>Código de indicação <span className="text-[var(--text-muted)]">(opcional)</span></>}
              autoComplete="off"
              value={values.referralCode}
              onChange={handleChange('referralCode')}
              placeholder="Ex: ABC12345"
              aria-invalid={!!errors.referralCode}
              aria-describedby="referral-code-error"
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
                setStep('data')
                setServerError('')
                setErrors({})
              }}
            >
              Alterar dados
            </Button>
          </div>
        </form>
      )}

      {invitePreview?.group && (
        <div className="mt-4">
          <InviteGroupCard
            group={invitePreview.group}
            hint="Crie sua conta para entrar neste bolão."
          />
        </div>
      )}

      {inviteCode && isInviteInvalid && (
        <p className="mt-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text)]">
          Convite inválido ou expirado. Você ainda pode criar sua conta e entrar em um bolão depois.
        </p>
      )}

      <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
        Já tem conta?{' '}
        <Link
          to={`/auth/login${loginSearch ? `?${loginSearch}` : ''}`}
          className="font-medium text-[var(--brand)] hover:underline"
        >
          Entrar
        </Link>
      </p>
    </AuthForm>
  )
}
