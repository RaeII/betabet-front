import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ToastVariant = 'default' | 'success' | 'error'

interface ToastItem {
  id: string
  title: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (opts: { title: string; variant?: ToastVariant }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback(({ title, variant = 'default' }: { title: string; variant?: ToastVariant }) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, title, variant }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2">
        {toasts.map(t => (
          <div
            key={t.id}
            role="alert"
            className={cn(
              'rounded-[var(--radius)] border bg-[var(--surface)] px-4 py-3 text-sm shadow-lg',
              t.variant === 'error' && 'border-red-500/30 text-red-600',
              t.variant === 'success' && 'border-green-500/30 text-green-600',
              t.variant === 'default' && 'border-[var(--border)] text-[var(--text)]',
            )}
          >
            {t.title}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.toast
}
