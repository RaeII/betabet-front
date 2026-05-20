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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium text-[var(--text)]">Nome</label>
          <Input id="name" autoComplete="name" value={values.name} onChange={handleChange('name')} aria-invalid={!!errors.name} />
          {errors.name && <span className="text-xs text-[var(--danger)]">{errors.name}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-[var(--text)]">E-mail</label>
          <Input id="email" type="email" autoComplete="email" value={values.email} onChange={handleChange('email')} aria-invalid={!!errors.email} />
          {errors.email && <span className="text-xs text-[var(--danger)]">{errors.email}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-[var(--text)]">Senha</label>
          <Input id="password" type="password" autoComplete="new-password" value={values.password} onChange={handleChange('password')} aria-invalid={!!errors.password} />
          {errors.password && <span className="text-xs text-[var(--danger)]">{errors.password}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--text)]">Confirmar senha</label>
          <Input id="confirmPassword" type="password" autoComplete="new-password" value={values.confirmPassword} onChange={handleChange('confirmPassword')} aria-invalid={!!errors.confirmPassword} />
          {errors.confirmPassword && <span className="text-xs text-[var(--danger)]">{errors.confirmPassword}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="referralCode" className="text-sm font-medium text-[var(--text)]">
            Código de indicação <span className="text-[var(--text-muted)]">(opcional)</span>
          </label>
          <Input id="referralCode" autoComplete="off" value={values.referralCode} onChange={handleChange('referralCode')} placeholder="Ex: ABC123" />
          {errors.referralCode && <span className="text-xs text-[var(--danger)]">{errors.referralCode}</span>}
        </div>

        {serverError && <p className="text-sm text-[var(--danger)]">{serverError}</p>}

        <Button type="submit" disabled={isSubmitting} className="mt-1 w-full">
          {isSubmitting ? 'Criando conta…' : 'Criar conta'}
        </Button>
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
