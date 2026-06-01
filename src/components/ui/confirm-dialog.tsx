import { Modal } from './modal'
import { Button } from './button'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  loadingLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  isLoading?: boolean
  destructive?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  loadingLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  isLoading = false,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onOpenChange={isLoading ? () => {} : onOpenChange}
      title={title}
      description={description}
      showClose={!isLoading}
    >
      <div className="flex justify-end gap-2 px-5 py-4">
        <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          variant={destructive ? 'destructive' : 'primary'}
          size="sm"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? loadingLabel ?? `${confirmLabel}…` : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
