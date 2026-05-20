import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--text)]',
        variant === 'success' && 'border-green-500/30 bg-green-500/10 text-green-600',
        variant === 'warning' && 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600',
        variant === 'danger' && 'border-red-500/30 bg-red-500/10 text-red-600',
        className,
      )}
      {...props}
    />
  )
}
