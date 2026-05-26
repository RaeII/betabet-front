import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AuthField } from './components/AuthField'
import { AuthForm } from './components/AuthForm'
import { InviteGroupCard } from '@/components/group/InviteGroupCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { useJoinByCode } from '@/hooks/useGroups'
import { RegisterSchema } from '@/lib/schemas'
import { resolveInviteCode } from '@/services/groups.service'
import { ApiRequestError } from '@/services/api'
import type { RegisterData } from '@/types/auth.types'

type FormValues = Omit<RegisterData, 'referralCode'> & { referralCode: string; confirmPassword: string }

export function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { register } = useAuth()
  const joinByCode = useJoinByCode()
  const inviteCode = searchParams.get('invite')
  const referralCode = searchParams.get('ref')

  const [values, setValues] = useState<FormValues>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: referralCode ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  async function handleSubmit(e: React.FormEvent) {
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
    setIsSubmitting(true)
    setServerError('')
    try {
      const { confirmPassword: _confirm, ...registerData } = result.data
      await register(registerData as RegisterData)
      if (inviteCode && !isInviteInvalid) {
        await attemptJoin(inviteCode)
      } else {
        navigate('/')
      }
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setServerError(error.message || 'Não foi possível criar a conta. Tente novamente.')
      } else {
        setServerError('Não foi possível criar a conta. Tente novamente.')
      }
      setIsSubmitting(false)
    }
  }

  const loginParams = new URLSearchParams()
  if (inviteCode) loginParams.set('invite', inviteCode)
  if (referralCode) loginParams.set('ref', referralCode)
  const loginSearch = loginParams.toString()

  return (
    <AuthForm title="Criar conta" subtitle="Participe do Bolão da Copa">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2" noValidate>
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

        <AuthField errorId="password-error" error={errors.password}>
          <Input
            id="password"
            label="Senha"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange('password')}
            aria-invalid={!!errors.password}
            aria-describedby="password-error"
          />
        </AuthField>

        <AuthField errorId="confirm-password-error" error={errors.confirmPassword}>
          <Input
            id="confirmPassword"
            label="Confirmar senha"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={handleChange('confirmPassword')}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby="confirm-password-error"
          />
        </AuthField>

        <AuthField errorId="referral-code-error" error={errors.referralCode}>
          <Input
            id="referralCode"
            label={<>Código de indicação <span className="text-[var(--text-muted)]">(opcional)</span></>}
            autoComplete="off"
            value={values.referralCode}
            onChange={handleChange('referralCode')}
            placeholder="Ex: ABC123"
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
            {isSubmitting ? 'Criando conta…' : 'Criar conta'}
          </Button>
        </div>
      </form>

      {invitePreview?.group && (
        <div className="mt-4">
          <InviteGroupCard
            group={invitePreview.group}
            hint="Crie sua conta para entrar neste grupo."
          />
        </div>
      )}

      {inviteCode && isInviteInvalid && (
        <p className="mt-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text)]">
          Convite inválido ou expirado. Você ainda pode criar sua conta e entrar em um grupo depois.
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
