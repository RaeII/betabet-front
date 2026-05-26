import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

interface JoinRejectedModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupName: string
  groupEmoji?: string | null
}

export function JoinRejectedModal({ open, onOpenChange, groupName, groupEmoji }: JoinRejectedModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Solicitação não aprovada">
      <div className="space-y-5 px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--surface-soft)] text-2xl">
            {groupEmoji ?? '🏆'}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-[var(--text)]">{groupName}</p>
            <p className="text-sm text-[var(--text-muted)]">Sua entrada não foi aprovada</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          O admin do grupo não aprovou sua solicitação. Você pode tentar novamente com outro convite ou criar o seu próprio bolão.
        </p>
        <Button onClick={() => onOpenChange(false)} className="w-full">
          Entendi
        </Button>
      </div>
    </Modal>
  )
}
