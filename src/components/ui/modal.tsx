import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
  showClose?: boolean
  labelledById?: string
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  showClose = true,
  labelledById,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0"
        />
        <Dialog.Content
          aria-labelledby={labelledById}
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 px-4 outline-none',
            'sm:max-w-md md:max-w-lg',
          )}
        >
          <div
            className={cn(
              'relative flex max-h-[90vh] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-xl',
              'focus-within:[&_*]:focus-visible:outline-[var(--support)]',
              className,
            )}
          >
            {title || description ? (
              <header className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
                <div className="min-w-0 flex-1 space-y-1">
                  {title ? (
                    <Dialog.Title
                      id={labelledById}
                      className="truncate text-lg font-bold text-[var(--text)]"
                    >
                      {title}
                    </Dialog.Title>
                  ) : null}
                  {description ? (
                    <Dialog.Description className="text-sm text-[var(--text-muted)]">
                      {description}
                    </Dialog.Description>
                  ) : null}
                </div>
                {showClose ? (
                  <Dialog.Close
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--support)]"
                    aria-label="Fechar"
                  >
                    <X size={16} />
                  </Dialog.Close>
                ) : null}
              </header>
            ) : null}
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
