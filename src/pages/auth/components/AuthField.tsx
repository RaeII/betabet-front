import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AuthFieldProps {
  children: ReactNode
  error?: string
  errorId: string
  className?: string
}

export function AuthField({ children, error, errorId, className }: AuthFieldProps) {
  const hasError = Boolean(error)

  return (
    <div className={cn('pb-4', className)}>
      <div className="relative">
        {children}
        <div
          id={errorId}
          className="pointer-events-none absolute inset-x-0 top-full mt-0.5 h-4 overflow-hidden"
          aria-live="polite"
          aria-atomic="true"
        >
          <span
            className={cn(
              'block truncate text-xs font-medium leading-4 text-[var(--danger)] transition duration-150',
              hasError ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
            )}
          >
            {error}
          </span>
        </div>
      </div>
    </div>
  )
}
