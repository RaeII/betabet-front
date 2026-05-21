import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GroupStatePanelProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function GroupStatePanel({ title, description, action, className }: GroupStatePanelProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 text-center',
        className,
      )}
    >
      <p className="text-base font-semibold text-[var(--text)]">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">
          {description}
        </p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}
