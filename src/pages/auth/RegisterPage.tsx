import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        <div className="flex flex-col gap-1">
          <Input
            id="name"
            label="Nome"
            autoComplete="name"
            value={values.name}
            onChange={handleChange('name')}
            aria-invalid={!!errors.name}
            aria-describedby="name-error"
          />
          <div id="name-error" className="min-h-5" aria-live="polite">
            <span
              className={`block text-xs text-[var(--danger)] transition duration-200 ${
                errors.name ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
              }`}
            >
              {errors.name}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
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
          <div id="email-error" className="min-h-5" aria-live="polite">
            <span
              className={`block text-xs text-[var(--danger)] transition duration-200 ${
                errors.email ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
              }`}
            >
              {errors.email}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
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
          <div id="password-error" className="min-h-5" aria-live="polite">
            <span
              className={`block text-xs text-[var(--danger)] transition duration-200 ${
                errors.password ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
              }`}
            >
              {errors.password}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
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
          <div id="confirm-password-error" className="min-h-5" aria-live="polite">
            <span
              className={`block text-xs text-[var(--danger)] transition duration-200 ${
                errors.confirmPassword ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
              }`}
            >
              {errors.confirmPassword}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
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
          <div id="referral-code-error" className="min-h-5" aria-live="polite">
            <span
              className={`block text-xs text-[var(--danger)] transition duration-200 ${
                errors.referralCode ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
              }`}
            >
              {errors.referralCode}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="min-h-5" aria-live="polite">
            <p
              className={`text-sm text-[var(--danger)] transition duration-200 ${
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
