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
import { LoginSchema } from '@/lib/schemas'
import { resolveInviteCode } from '@/services/groups.service'
import { applyReferralCode } from '@/services/referral.service'
import { ApiRequestError } from '@/services/api'
import type { LoginCredentials } from '@/types/auth.types'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inviteCode = searchParams.get('invite')
  const referralCode = searchParams.get('ref')
  const { login } = useAuth()
  const joinByCode = useJoinByCode()
  const [values, setValues] = useState<LoginCredentials>({ email: '', password: '' })
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  async function attemptJoin(code: string): Promise<void> {
    try {
      const { joined, group } = await joinByCode.mutateAsync({ code })
      if (joined) {
        navigate(`/groups/${group.id}`, { replace: true })
        return
      }
      navigate('/', {
        replace: true,
        state: { pendingJoin: { groupName: group.name, groupEmoji: group.emoji } },
      })
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 409 && invitePreview?.group) {
        navigate(`/groups/${invitePreview.group.id}`, { replace: true })
        return
      }
      navigate('/', { replace: true })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = LoginSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors: Partial<LoginCredentials> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof LoginCredentials
        fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setIsSubmitting(true)
    setServerError('')
    try {
      await login({ email: result.data.email, password: result.data.password })
      if (referralCode) {
        try { await applyReferralCode(referralCode) } catch { /* duplicate / self-ref ignored */ }
      }
      if (inviteCode && !isInviteInvalid) {
        await attemptJoin(inviteCode)
      } else {
        navigate('/')
      }
    } catch {
      setServerError('E-mail ou senha inválidos.')
      setIsSubmitting(false)
    }
  }

  const registerParams = new URLSearchParams()
  if (inviteCode) registerParams.set('invite', inviteCode)
  if (referralCode) registerParams.set('ref', referralCode)
  const registerSearch = registerParams.toString()

  return (
    <AuthForm title="Bolão da Copa" subtitle="Entre na sua conta para apostar">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2" noValidate>
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
            autoComplete="current-password"
            value={values.password}
            onChange={handleChange('password')}
            aria-invalid={!!errors.password}
            aria-describedby="password-error"
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
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </div>
      </form>

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
