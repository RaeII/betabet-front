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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-[var(--text)]">
            E-mail
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange('email')}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <span className="text-xs text-[var(--danger)]">{errors.email}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-[var(--text)]">
            Senha
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={handleChange('password')}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <span className="text-xs text-[var(--danger)]">{errors.password}</span>
          )}
        </div>

        {serverError && (
          <p className="text-sm text-[var(--danger)]">{serverError}</p>
        )}

        <Button type="submit" disabled={isSubmitting} className="mt-1 w-full">
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </Button>
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
