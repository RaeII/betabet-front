import { Minus, Plus } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

interface StepperProps {
  label?: ReactNode
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  return Math.max(min, Math.min(max, value))
}

/**
 * Seletor numérico otimizado para mobile: botões −/+ com alvos de toque amplos
 * (44px) e repetição ao segurar, além do valor central editável pelo teclado
 * numérico. Substitui o `<input type="number">`, que tem alvos minúsculos e UX
 * ruim em telas de toque.
 */
export function Stepper({ label, value, onChange, min = 0, max = 99, step = 1 }: StepperProps) {
  const id = useId()
  const valueRef = useRef(value)
  valueRef.current = value
  const holdTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  function stopHold() {
    if (holdTimeout.current) clearTimeout(holdTimeout.current)
    if (holdInterval.current) clearInterval(holdInterval.current)
    holdTimeout.current = null
    holdInterval.current = null
  }

  useEffect(() => stopHold, [])

  function apply(dir: 1 | -1) {
    const next = clamp(valueRef.current + dir * step, min, max)
    if (next === valueRef.current) {
      stopHold()
      return
    }
    onChange(next)
  }

  function startHold(dir: 1 | -1) {
    apply(dir)
    holdTimeout.current = setTimeout(() => {
      holdInterval.current = setInterval(() => apply(dir), 80)
    }, 400)
  }

  const stepBtn =
    'flex w-12 shrink-0 select-none items-center justify-center self-stretch text-[var(--text)] transition-colors active:bg-[var(--surface-soft)] disabled:opacity-30 disabled:active:bg-transparent'

  return (
    <div className="relative w-full">
      <div className="flex min-h-12 items-stretch overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] transition-shadow focus-within:border-[var(--brand)] focus-within:shadow-[0_0_0_2px_color-mix(in_srgb,var(--brand)_10%,transparent)]">
        <button
          type="button"
          aria-label="Diminuir"
          tabIndex={-1}
          disabled={value <= min}
          onPointerDown={() => startHold(-1)}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
          className={`${stepBtn} border-r border-[var(--border)]`}
        >
          <Minus size={18} />
        </button>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          aria-label={typeof label === 'string' ? label : undefined}
          onFocus={e => e.target.select()}
          onChange={e => {
            const digits = e.target.value.replace(/\D/g, '')
            onChange(digits === '' ? min : clamp(Number(digits), min, max))
          }}
          className="w-full min-w-0 bg-transparent text-center text-lg font-bold text-[var(--text)] caret-[var(--brand)] outline-none"
        />
        <button
          type="button"
          aria-label="Aumentar"
          tabIndex={-1}
          disabled={value >= max}
          onPointerDown={() => startHold(1)}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
          className={`${stepBtn} border-l border-[var(--border)]`}
        >
          <Plus size={18} />
        </button>
      </div>
      {label && (
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-3 top-0 z-10 -translate-y-1/2 bg-[var(--surface)] px-1 text-xs font-medium text-[var(--text-muted)]"
        >
          {label}
        </label>
      )}
    </div>
  )
}
