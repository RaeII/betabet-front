import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'

interface SwitchProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'checked' | 'defaultChecked' | 'onChange' | 'size' | 'type'
  > {
  checked: boolean
  loading?: boolean
  onCheckedChange: (checked: boolean) => void
}

export function Switch({
  checked,
  className,
  disabled,
  loading = false,
  onCheckedChange,
  ...props
}: SwitchProps) {
  const isDisabled = disabled || loading

  return (
    <label
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full',
        isDisabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <input
        {...props}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        disabled={isDisabled}
        onChange={event => onCheckedChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-0 rounded-full border transition-colors duration-200 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--support)]',
          checked
            ? 'border-[var(--brand)] bg-[var(--brand)]'
            : 'border-[var(--border)] bg-[var(--surface-soft)]',
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          'relative h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-6' : 'translate-x-1',
          loading && 'opacity-0',
        )}
      />
      {loading && (
        <Loader2
          size={14}
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin',
            checked ? 'text-white' : 'text-[var(--text-muted)]',
          )}
        />
      )}
    </label>
  )
}
