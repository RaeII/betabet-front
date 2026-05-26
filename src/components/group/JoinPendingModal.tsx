import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

interface JoinPendingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupName: string
  groupEmoji?: string | null
}

export function JoinPendingModal({ open, onOpenChange, groupName, groupEmoji }: JoinPendingModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Solicitação enviada">
      <div className="space-y-5 px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--surface-soft)] text-2xl">
            {groupEmoji ?? '🏆'}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-[var(--text)]">{groupName}</p>
            <p className="text-sm text-[var(--text-muted)]">Aguardando aprovação</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          O admin do grupo precisa aprovar sua entrada. Assim que liberado, o grupo aparece automaticamente na sua lista.
        </p>
        <Button onClick={() => onOpenChange(false)} className="w-full">
          Entendi
        </Button>
      </div>
    </Modal>
  )
}
