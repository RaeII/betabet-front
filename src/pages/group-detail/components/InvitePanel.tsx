import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface InvitePanelProps {
  inviteCode: string
  referralCode?: string | null
}

function buildInviteUrl(inviteCode: string, referralCode?: string | null) {
  const baseUrl = `${window.location.origin}/invite/${encodeURIComponent(inviteCode)}`
  if (!referralCode) return baseUrl
  return `${baseUrl}?ref=${encodeURIComponent(referralCode)}`
}

export function InvitePanel({ inviteCode, referralCode }: InvitePanelProps) {
  const [copied, setCopied] = useState(false)
  const inviteUrl = buildInviteUrl(inviteCode, referralCode)

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
    </div>
  )
}
