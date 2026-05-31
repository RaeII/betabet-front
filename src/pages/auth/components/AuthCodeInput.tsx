import { useRef } from 'react'
import { cn } from '@/lib/utils'

const CODE_LENGTH = 6

interface AuthCodeInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  errorId: string
  invalid?: boolean
  disabled?: boolean
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '').slice(0, CODE_LENGTH)
}

function codeToDigits(value: string) {
  const normalized = onlyDigits(value)
  return Array.from({ length: CODE_LENGTH }, (_, index) => normalized[index] ?? '')
}

export function AuthCodeInput({
  id,
  value,
  onChange,
  errorId,
  invalid = false,
  disabled = false,
}: AuthCodeInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const labelId = `${id}-label`
  const digits = codeToDigits(value)

  function focusInput(index: number) {
    const input = inputsRef.current[index]
    if (!input) return
    input.focus()
    input.setSelectionRange(input.value.length, input.value.length)
  }

  function commitDigits(nextDigits: string[]) {
    onChange(nextDigits.join('').slice(0, CODE_LENGTH))
  }

  function fillFrom(index: number, rawValue: string) {
    const incomingDigits = onlyDigits(rawValue)
    if (!incomingDigits) return

    const nextDigits = [...digits]
    const startIndex = incomingDigits.length >= CODE_LENGTH ? 0 : index
    const availableDigits = incomingDigits.slice(0, CODE_LENGTH - startIndex)

    for (let offset = 0; offset < availableDigits.length; offset += 1) {
      nextDigits[startIndex + offset] = availableDigits[offset]
    }

    commitDigits(nextDigits)
    focusInput(Math.min(startIndex + availableDigits.length, CODE_LENGTH - 1))
  }

  function clearDigit(index: number) {
    const nextDigits = [...digits]
    nextDigits[index] = ''
    commitDigits(nextDigits)
  }

  return (
    <div role="group" aria-labelledby={labelId} className="grid grid-cols-6 gap-2">
      <span id={labelId} className="sr-only">Código</span>
      {digits.map((digit, index) => {
        const digitId = `${id}-${index}`
        const digitLabelId = `${digitId}-label`

        return (
          <div key={digitId} className="min-w-0">
            <span id={digitLabelId} className="sr-only">
              Dígito {index + 1}
            </span>
            <input
              ref={element => {
                inputsRef.current[index] = element
              }}
              id={digitId}
              name={digitId}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              autoFocus={index === 0}
              value={digit}
              disabled={disabled}
              aria-labelledby={`${labelId} ${digitLabelId}`}
              aria-invalid={invalid}
              aria-describedby={errorId}
              className={cn(
                'h-12 w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-center text-lg font-semibold tabular-nums text-[var(--text)] caret-transparent transition duration-150',
                'focus:border-[var(--brand)] focus:outline-none focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--brand)_10%,transparent)]',
                'disabled:cursor-not-allowed disabled:opacity-50',
                invalid && 'border-[var(--danger)]',
              )}
              onFocus={event => {
                event.currentTarget.setSelectionRange(digit.length, digit.length)
              }}
              onClick={event => {
                event.currentTarget.setSelectionRange(digit.length, digit.length)
              }}
              onPaste={event => {
                event.preventDefault()
                fillFrom(index, event.clipboardData.getData('text'))
              }}
              onChange={event => {
                const nextValue = onlyDigits(event.target.value)
                if (!nextValue) {
                  clearDigit(index)
                  return
                }
                fillFrom(index, nextValue)
              }}
              onKeyDown={event => {
                if (/^\d$/.test(event.key)) {
                  event.preventDefault()
                  fillFrom(index, event.key)
                  return
                }

                if (event.key === 'Backspace') {
                  event.preventDefault()
                  if (digits[index]) {
                    clearDigit(index)
                  } else if (index > 0) {
                    const nextDigits = [...digits]
                    nextDigits[index - 1] = ''
                    commitDigits(nextDigits)
                    focusInput(index - 1)
                  }
                  return
                }

                if (event.key === 'Delete') {
                  event.preventDefault()
                  clearDigit(index)
                  return
                }

                if (event.key === 'ArrowLeft' && index > 0) {
                  event.preventDefault()
                  focusInput(index - 1)
                  return
                }

                if (event.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
                  event.preventDefault()
                  focusInput(index + 1)
                }
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
