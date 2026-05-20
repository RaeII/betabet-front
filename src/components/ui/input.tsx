import { cn } from '@/lib/utils'
import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
}

const baseInputClasses =
  'flex min-h-12 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] caret-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand)] focus:outline-none focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--brand)_10%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_var(--surface)_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:var(--text)] [&:-webkit-autofill:focus]:[-webkit-box-shadow:0_0_0_1000px_var(--surface)_inset,0_0_0_2px_color-mix(in_srgb,var(--brand)_10%,transparent)]'

export function Input({ className, id, label, placeholder, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  if (!label) {
    return (
      <input
        id={id}
        placeholder={placeholder}
        className={cn(baseInputClasses, className)}
        {...props}
      />
    )
  }

  return (
    <div className="relative w-full">
      <input
        id={inputId}
        placeholder={placeholder ?? ' '}
        className={cn(
          baseInputClasses,
          'peer placeholder:text-transparent focus:placeholder:text-[var(--text-muted)]',
          className,
        )}
        {...props}
      />
      <label
        htmlFor={inputId}
        className="pointer-events-none absolute left-3 top-0 z-10 -translate-y-1/2 bg-[var(--surface)] px-1 text-xs font-medium text-[var(--text-muted)] transition-all duration-150 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-[var(--brand)] peer-disabled:opacity-50"
      >
        {label}
      </label>
    </div>
  )
}
