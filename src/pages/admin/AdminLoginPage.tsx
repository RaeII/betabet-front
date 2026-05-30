import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthField } from '@/pages/auth/components/AuthField'
import { AuthForm } from '@/pages/auth/components/AuthForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminLoginSchema } from '@/lib/schemas'
import type { AdminLoginCredentials } from '@/types/auth.types'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const { adminLogin } = useAdminAuth()
  const [values, setValues] = useState<AdminLoginCredentials>({ email: '', password: '' })
  const [errors, setErrors] = useState<Partial<AdminLoginCredentials>>({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(field: keyof AdminLoginCredentials) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues(prev => ({ ...prev, [field]: e.target.value }))
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = AdminLoginSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors: Partial<AdminLoginCredentials> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof AdminLoginCredentials
        fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setIsSubmitting(true)
    setServerError('')
    try {
      await adminLogin(result.data.email, result.data.password)
      navigate('/admin')
    } catch {
      setServerError('E-mail ou senha inválidos.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthForm title="Admin Panel" subtitle="Acesso restrito ao painel administrativo">
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
    </AuthForm>
  )
}
