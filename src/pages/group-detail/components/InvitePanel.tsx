import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useJoinRequests, useHandleJoinRequest } from '@/hooks/useGroups'
import type { GroupRole } from '@/types/group.types'

interface InvitePanelProps {
  groupId: string
  inviteCode: string
  role: GroupRole
}

export function InvitePanel({ groupId, inviteCode, role }: InvitePanelProps) {
  const [copied, setCopied] = useState(false)
  const isAdmin = role === 'admin'
  const { data } = useJoinRequests(groupId, isAdmin)
  const handleRequest = useHandleJoinRequest(groupId)

  const inviteUrl = `${window.location.origin}/invite/${inviteCode}`

  async function copyLink() {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-[var(--text)]">Link de convite</p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={inviteUrl}
            className="flex-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-muted)]"
          />
          <Button variant="secondary" size="icon" onClick={copyLink}>
            {copied ? <Check size={16} className="text-[var(--success)]" /> : <Copy size={16} />}
          </Button>
        </div>
      </div>

      {isAdmin && data?.requests && data.requests.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--text)]">Solicitações pendentes</p>
          {data.requests.map(req => (
            <div key={req.id} className="flex items-center gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-3">
              <span className="flex-1 text-sm text-[var(--text)]">{req.user.name}</span>
              <Button
                size="sm"
                onClick={() => handleRequest.mutate({ requestId: req.id, action: 'approve' })}
                disabled={handleRequest.isPending}
              >
                Aceitar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRequest.mutate({ requestId: req.id, action: 'reject' })}
                disabled={handleRequest.isPending}
              >
                Recusar
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
