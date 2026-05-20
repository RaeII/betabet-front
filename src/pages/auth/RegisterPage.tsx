import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthField } from './components/AuthField'
import { AuthForm } from './components/AuthForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { RegisterSchema } from '@/lib/schemas'
import type { RegisterData } from '@/types/auth.types'

type FormValues = Omit<RegisterData, 'referralCode'> & { referralCode: string; confirmPassword: string }

export function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { register } = useAuth()

  const [values, setValues] = useState<FormValues>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: searchParams.get('ref') ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(field: keyof FormValues) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues(prev => ({ ...prev, [field]: e.target.value }))
      setErrors(prev => ({ ...prev, [field]: undefined }))
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
      navigate('/')
    } catch {
      setServerError('Não foi possível criar a conta. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

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

      <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
        Já tem conta?{' '}
        <Link to="/auth/login" className="font-medium text-[var(--brand)] hover:underline">
          Entrar
        </Link>
      </p>
    </AuthForm>
  )
}
