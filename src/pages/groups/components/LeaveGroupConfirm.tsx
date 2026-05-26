import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { useLeaveGroup } from '@/hooks/useLeaveGroup'

interface LeaveGroupConfirmProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  groupName: string
}

export function LeaveGroupConfirm({
  open,
  onOpenChange,
  groupId,
  groupName,
}: LeaveGroupConfirmProps) {
  const leave = useLeaveGroup(groupId)

  function handleConfirm() {
    leave.mutate(undefined, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Sair de ${groupName}?`}
      description="Você perderá acesso ao ranking, palpites e configurações deste grupo. Esta ação pode ser desfeita aceitando um novo convite."
    >
      <div className="flex flex-col gap-3 p-5 sm:flex-row-reverse">
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={leave.isPending}
          variant="destructive"
          className="w-full sm:w-auto"
        >
          {leave.isPending ? 'Saindo…' : 'Sair'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => onOpenChange(false)}
          disabled={leave.isPending}
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>
        {leave.isError ? (
          <p
            role="alert"
            className="flex-1 self-center text-sm text-[var(--danger)]"
          >
            Não foi possível sair do grupo. Tente novamente.
          </p>
        ) : null}
      </div>
    </Modal>
  )
}
