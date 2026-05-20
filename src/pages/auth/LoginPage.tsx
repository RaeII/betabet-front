import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthForm } from './components/AuthForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { LoginSchema } from '@/lib/schemas'
import type { LoginCredentials } from '@/types/auth.types'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [values, setValues] = useState<LoginCredentials>({ email: '', password: '' })
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(field: keyof LoginCredentials) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues(prev => ({ ...prev, [field]: e.target.value }))
      setErrors(prev => ({ ...prev, [field]: undefined }))
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
      navigate('/')
    } catch {
      setServerError('E-mail ou senha inválidos.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthForm title="Bolão da Copa" subtitle="Entre na sua conta para apostar">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
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
            autoComplete="current-password"
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
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </div>
      </form>

      <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
        Não tem conta?{' '}
        <Link to="/auth/register" className="font-medium text-[var(--brand)] hover:underline">
          Cadastre-se
        </Link>
      </p>
    </AuthForm>
  )
}
